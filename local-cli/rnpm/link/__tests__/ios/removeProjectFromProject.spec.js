'use strict';

jest.autoMockOff();

const xcode = require('xcode');
const pbxFile = require('xcode/lib/pbxFile');
const addFileToProject = require('../../src/ios/addFileToProject');
const removeProjectFromProject = require('../../src/ios/removeProjectFromProject');
const path = require('path');
const include = require('../include');

const project = xcode.project(
  path.join(__dirname, '../fixtures/project.pbxproj')
);
const filePath = '../fixtures/linearGradient.pbxproj';

describe('ios::addFileToProject', () => {
  beforeEach(() => {
    project.parseSync();
    addFileToProject(project, filePath);
  });

  it('should return removed file', () => {
    expect(removeProjectFromProject(project, filePath) instanceof pbxFile)
      .toBeTruthy();
  });

  it('should remove file from a project', () => {
    const file = removeProjectFromProject(project, filePath);
    expect(project.pbxFileReferenceSection()[file.fileRef]).not.toBeDefined();
  });

  xit('should remove file from PBXContainerProxy', () => {
    // todo(mike): add in .xcodeproj after Xcode modifications so we can test extra
    // removals later.
  });
});
