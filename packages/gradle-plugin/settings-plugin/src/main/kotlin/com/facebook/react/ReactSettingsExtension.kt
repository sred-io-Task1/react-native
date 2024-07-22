/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react

import com.facebook.react.utils.JsonUtils
import java.io.File
import java.math.BigInteger
import java.security.MessageDigest
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import org.gradle.api.GradleException
import org.gradle.api.file.FileCollection
import org.gradle.api.initialization.Settings
import org.gradle.api.logging.Logging

abstract class ReactSettingsExtension @Inject constructor(val settings: Settings) {

  private val outputFile =
      settings.layout.rootDirectory.file("build/generated/autolinking/autolinking.json").asFile
  private val outputFolder =
      settings.layout.rootDirectory.file("build/generated/autolinking/").asFile

  /**
   * Utility function to autolink libraries using an external command as source of truth.
   *
   * This should be invoked inside the `settings.gradle` file, and will make sure the Gradle project
   * is loading all the discovered libraries.
   *
   * @param command The command to execute to get the autolinking configuration. Default is
   *   `npx @react-native-community/cli config --platform android`.
   * @param workingDirectory The directory where the command should be executed.
   * @param lockFiles The list of lock files to check for changes (if lockfiles are not changed, the
   *   command will not be executed).
   */
  @JvmOverloads
  public fun autolinkLibrariesFromCommand(
      command: List<String> =
          listOf("npx", "@react-native-community/cli", "config", "--platform", "android"),
      workingDirectory: File? = settings.layout.rootDirectory.dir("../").asFile,
      lockFiles: FileCollection =
          settings.layout.rootDirectory
              .dir("../")
              .files("yarn.lock", "package-lock.json", "package.json", "react-native.config.js")
  ) {
    outputFile.parentFile.mkdirs()
    val lockFilesChanged = checkAndUpdateLockfiles(lockFiles, outputFolder)
    if (lockFilesChanged || outputFile.exists().not() || outputFile.length() != 0L) {
      val process =
          ProcessBuilder(command)
              .directory(workingDirectory)
              .redirectOutput(ProcessBuilder.Redirect.to(outputFile))
              .redirectError(ProcessBuilder.Redirect.INHERIT)
              .start()
      val finished = process.waitFor(5, TimeUnit.MINUTES)
      if (!finished || (process.exitValue() != 0)) {
        val prefixCommand =
            "ERROR: autolinkLibrariesFromCommand: process ${command.joinToString(" ")}"
        val message =
            if (!finished) "${prefixCommand} timed out"
            else "${prefixCommand} exited with error code: ${process.exitValue()}"
        val logger = Logging.getLogger("ReactSettingsExtension")
        logger.error(message)
        if (outputFile.length() != 0L) {
          logger.error(outputFile.readText().substring(0, 1024))
        }
        outputFile.delete()
        throw GradleException(message)
      }
    }
    linkLibraries(getLibrariesToAutolink(outputFile))
  }

  /**
   * Utility function to autolink libraries using an external file as source of truth.
   *
   * The file should be a JSON file with the same structure as the one generated by the
   * `npx @react-native-community/cli config` command.
   *
   * @param autolinkConfigFile The file to read the autolinking configuration from.
   */
  public fun autolinkLibrariesFromConfigFile(
      autolinkConfigFile: File,
  ) {
    // We copy the file to the build directory so that the various Gradle tasks can access it.
    autolinkConfigFile.copyTo(outputFile, overwrite = true)
    linkLibraries(getLibrariesToAutolink(autolinkConfigFile))
  }

  /**
   * Utility function so that for each tuple :project-name -> project-dir, it instructs Gradle to
   * lad this extra module.
   */
  private fun linkLibraries(input: Map<String, File>) {
    input.forEach { (path, projectDir) ->
      settings.include(path)
      settings.project(path).projectDir = projectDir
    }
  }

  companion object {
    private val md = MessageDigest.getInstance("SHA-256")

    /**
     * Utility function to check if the provided lockfiles have been updated or not. This function
     * will both check and update the lockfiles hashes if necessary.
     *
     * @param lockFiles The [FileCollection] of the lockfiles to check.
     * @param outputFolder The folder where the hashes will be stored.
     * @return `true` if the lockfiles have been updated, `false` otherwise.
     */
    internal fun checkAndUpdateLockfiles(lockFiles: FileCollection, outputFolder: File): Boolean {
      var changed = false
      lockFiles.forEach { lockFile ->
        if (lockFile.exists()) {
          val sha = computeSha256(lockFile)
          val shaFile = File(outputFolder, "${lockFile.name}.sha")
          if (shaFile.exists().not() || shaFile.readText() != sha) {
            shaFile.writeText(sha)
            changed = true
          }
        }
      }
      return changed
    }

    internal fun getLibrariesToAutolink(buildFile: File): Map<String, File> {
      val model = JsonUtils.fromAutolinkingConfigJson(buildFile)
      return model
          ?.dependencies
          ?.values
          // We handle scenarios where there are deps that are
          // iOS-only or missing the Android configs.
          ?.filter { it.platforms?.android?.sourceDir != null }
          // We want to skip dependencies that are pure C++ as they won't contain a .gradle file.
          ?.filterNot { it.platforms?.android?.isPureCxxDependency == true }
          ?.associate { deps ->
            ":${deps.nameCleansed}" to File(deps.platforms?.android?.sourceDir)
          } ?: emptyMap()
    }

    internal fun computeSha256(lockFile: File) =
        String.format("%032x", BigInteger(1, md.digest(lockFile.readBytes())))
  }
}
