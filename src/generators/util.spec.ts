import { basename, join } from 'path';
import * as fs from 'fs';
import * as Constants from '../util/constants';
import * as helpers from '../util/helpers';
import * as globUtils from '../util/glob-util';
import * as util from './util';
import * as GeneratorConstants from './constants';
import * as TypeScriptUtils from '../util/typescript-utils';

describe('util', () => {
  describe('hydrateRequest', () => {
    it('should take a component request and return a hydrated component request', () => {
      // arrange
      const componentsDir = '/Users/noone/project/src/components';
      const context = {
        componentsDir: componentsDir
      };
      const request = {
        type: Constants.COMPONENT,
        name: 'settings view',
        includeSpec: true,
        includeNgModule: true
      };

      const templateDir = '/Users/noone/project/node_modules/ionic-angular/templates';
      spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(templateDir);

      // act
      const hydratedRequest = util.hydrateRequest(context, request);

      // assert
      expect(hydratedRequest).toEqual({'className': 'SettingsViewComponent', 'dirToRead': '/Users/noone/project/node_modules/ionic-angular/templates/component', 'dirToWrite': '/Users/noone/project/src/components/settings-view', 'fileName': 'settings-view', 'includeNgModule': true, 'includeSpec': true, 'name': 'settings view', 'type': 'component'});
      expect(hydratedRequest.type).toEqual(Constants.COMPONENT);
      expect(hydratedRequest.name).toEqual(request.name);
      expect(hydratedRequest.includeNgModule).toBeTruthy();
      expect(hydratedRequest.includeSpec).toBeTruthy();
      expect(hydratedRequest.className).toEqual('SettingsViewComponent');
      expect(hydratedRequest.fileName).toEqual('settings-view');
      expect(hydratedRequest.dirToRead).toEqual(join(templateDir, Constants.COMPONENT));
      expect(hydratedRequest.dirToWrite).toEqual(join(componentsDir, hydratedRequest.fileName));
    });

    it('should take a page request and return a hydrated page request', () => {
      // arrange
      const pagesDir = '/Users/noone/project/src/pages';
      const context = {
        pagesDir: pagesDir
      };
      const request = {
        type: Constants.PAGE,
        name: 'settings view',
        includeSpec: true,
        includeNgModule: true
      };

      const templateDir = '/Users/noone/project/node_modules/ionic-angular/templates';
      spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(templateDir);

      // act
      const hydratedRequest = util.hydrateRequest(context, request);

      // assert
      expect(hydratedRequest).toEqual({'className': 'SettingsViewPage', 'dirToRead': '/Users/noone/project/node_modules/ionic-angular/templates/page', 'dirToWrite': '/Users/noone/project/src/pages/settings-view', 'fileName': 'settings-view', 'includeNgModule': true, 'includeSpec': true, 'name': 'settings view', 'type': 'page'});
      expect(hydratedRequest.type).toEqual(Constants.PAGE);
      expect(hydratedRequest.name).toEqual(request.name);
      expect(hydratedRequest.includeNgModule).toBeTruthy();
      expect(hydratedRequest.includeSpec).toBeTruthy();
      expect(hydratedRequest.className).toEqual('SettingsViewPage');
      expect(hydratedRequest.fileName).toEqual('settings-view');
      expect(hydratedRequest.dirToRead).toEqual(join(templateDir, Constants.PAGE));
      expect(hydratedRequest.dirToWrite).toEqual(join(pagesDir, hydratedRequest.fileName));
    });
  });

  describe('readTemplates', () => {
    it('should get a map of templates and their content back', () => {
      // arrange
      const templateDir = '/Users/noone/project/node_modules/ionic-angular/templates/component';
      const knownValues = ['html.tmpl', 'scss.tmpl', 'spec.ts.tmpl', 'ts.tmpl', 'module.tmpl'];
      const fileContent = 'SomeContent';
      spyOn(fs, 'readdirSync').and.returnValue(knownValues);
      spyOn(helpers, helpers.readFileAsync.name).and.returnValue(Promise.resolve(fileContent));

      // act
      const promise = util.readTemplates(templateDir);

      // assert
      return promise.then((map: Map<string, string>) => {
        expect(map.get(join(templateDir, knownValues[0]))).toEqual(fileContent);
        expect(map.get(join(templateDir, knownValues[1]))).toEqual(fileContent);
        expect(map.get(join(templateDir, knownValues[2]))).toEqual(fileContent);
        expect(map.get(join(templateDir, knownValues[3]))).toEqual(fileContent);
        expect(map.get(join(templateDir, knownValues[4]))).toEqual(fileContent);
      });
    });
  });

  describe('filterOutTemplates', () => {
    it('should preserve all templates', () => {
      const map = new Map<string, string>();
      const templateDir = '/Users/noone/project/node_modules/ionic-angular/templates/component';
      const fileContent = 'SomeContent';
      const knownValues = ['html.tmpl', 'scss.tmpl', 'spec.ts.tmpl', 'ts.tmpl', 'module.tmpl'];
      map.set(join(templateDir, knownValues[0]), fileContent);
      map.set(join(templateDir, knownValues[1]), fileContent);
      map.set(join(templateDir, knownValues[2]), fileContent);
      map.set(join(templateDir, knownValues[3]), fileContent);
      map.set(join(templateDir, knownValues[4]), fileContent);

      const newMap = util.filterOutTemplates({includeNgModule: true, includeSpec: true}, map);
      expect(newMap.size).toEqual(knownValues.length);
    });

    it('should remove spec', () => {
      const map = new Map<string, string>();
      const templateDir = '/Users/noone/project/node_modules/ionic-angular/templates/component';
      const fileContent = 'SomeContent';
      const knownValues = ['html.tmpl', 'scss.tmpl', 'spec.ts.tmpl', 'ts.tmpl', 'module.tmpl'];
      map.set(join(templateDir, knownValues[0]), fileContent);
      map.set(join(templateDir, knownValues[1]), fileContent);
      map.set(join(templateDir, knownValues[2]), fileContent);
      map.set(join(templateDir, knownValues[3]), fileContent);
      map.set(join(templateDir, knownValues[4]), fileContent);

      const newMap = util.filterOutTemplates({includeNgModule: true, includeSpec: false}, map);
      expect(newMap.size).toEqual(4);
      expect(newMap.get(join(templateDir, knownValues[0]))).toBeTruthy();
      expect(newMap.get(join(templateDir, knownValues[1]))).toBeTruthy();
      expect(newMap.get(join(templateDir, knownValues[2]))).toBeFalsy();
      expect(newMap.get(join(templateDir, knownValues[3]))).toBeTruthy();
      expect(newMap.get(join(templateDir, knownValues[4]))).toBeTruthy();
    });

    it('should remove spec and module', () => {
      const map = new Map<string, string>();
      const templateDir = '/Users/noone/project/node_modules/ionic-angular/templates/component';
      const fileContent = 'SomeContent';
      const knownValues = ['html.tmpl', 'scss.tmpl', 'spec.ts.tmpl', 'ts.tmpl', 'module.ts.tmpl'];
      map.set(join(templateDir, knownValues[0]), fileContent);
      map.set(join(templateDir, knownValues[1]), fileContent);
      map.set(join(templateDir, knownValues[2]), fileContent);
      map.set(join(templateDir, knownValues[3]), fileContent);
      map.set(join(templateDir, knownValues[4]), fileContent);

      const newMap = util.filterOutTemplates({includeNgModule: false, includeSpec: false}, map);
      expect(newMap.size).toEqual(3);
      expect(newMap.get(join(templateDir, knownValues[0]))).toBeTruthy();
      expect(newMap.get(join(templateDir, knownValues[1]))).toBeTruthy();
      expect(newMap.get(join(templateDir, knownValues[2]))).toBeFalsy();
      expect(newMap.get(join(templateDir, knownValues[3]))).toBeTruthy();
      expect(newMap.get(join(templateDir, knownValues[4]))).toBeFalsy();
    });
  });

  describe('applyTemplates', () => {
    it('should replace the template content', () => {
      const fileOne = '/Users/noone/fileOne';

      const fileOneContent = `
<!--
  Generated template for the $CLASSNAME component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
-->

{{text}}

      `;

      const fileTwo = '/Users/noone/fileTwo';
      const fileTwoContent = `
$FILENAME {

}
      `;

      const fileThree = '/Users/noone/fileThree';
      const fileThreeContent = `
describe('$CLASSNAME', () => {
  it('should do something', () => {
    expect(true).toEqual(true);
  });
});
      `;

      const fileFour = '/Users/noone/fileFour';
      const fileFourContent = `
import { Component } from '@angular/core';

/*
  Generated class for the $CLASSNAME component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: '$FILENAME',
  templateUrl: '$FILENAME.html'
})
export class $CLASSNAMEComponent {

  text: string;

  constructor() {
    console.log('Hello $CLASSNAME Component');
    this.text = 'Hello World';
  }

}

      `;

      const fileFive = '/Users/noone/fileFive';
      const fileFiveContent = `
import { NgModule } from '@angular/core';
import { $CLASSNAME } from './$FILENAME';
import { IonicModule } from 'ionic-angular';

@NgModule({
  declarations: [
    $CLASSNAME,
  ],
  imports: [
    IonicModule.forChild($CLASSNAME)
  ],
  entryComponents: [
    $CLASSNAME
  ],
  providers: []
})
export class $CLASSNAMEModule {}
      `;

      const fileSix = '/Users/noone/fileSix';
      const fileSixContent = `
<!--
  Generated template for the $CLASSNAME page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
-->
<ion-header>

  <ion-navbar>
    <ion-title>$SUPPLIEDNAME</ion-title>
  </ion-navbar>

</ion-header>


<ion-content padding>

</ion-content>
      `;

      const fileSeven = '/Users/noone/fileSeven';
      const fileSevenContent = `
<ion-tabs>
$TAB_CONTENT
</ion-tabs>
      `;

      const map = new Map<string, string>();
      map.set(fileOne, fileOneContent);
      map.set(fileTwo, fileTwoContent);
      map.set(fileThree, fileThreeContent);
      map.set(fileFour, fileFourContent);
      map.set(fileFive, fileFiveContent);
      map.set(fileSix, fileSixContent);
      map.set(fileSeven, fileSevenContent);

      const className = 'SettingsView';
      const fileName = 'settings-view';
      const suppliedName = 'settings view';

      const results = util.applyTemplates({ name: suppliedName, className: className, fileName: fileName}, map);
      const modifiedContentOne = results.get(fileOne);
      const modifiedContentTwo = results.get(fileTwo);
      const modifiedContentThree = results.get(fileThree);
      const modifiedContentFour = results.get(fileFour);
      const modifiedContentFive = results.get(fileFive);
      const modifiedContentSix = results.get(fileSix);
      const modifiedContentSeven = results.get(fileSeven);
      const nonExistentVars = [
        GeneratorConstants.CLASSNAME_VARIABLE,
        GeneratorConstants.FILENAME_VARIABLE,
        GeneratorConstants.SUPPLIEDNAME_VARIABLE,
        GeneratorConstants.TAB_CONTENT_VARIABLE,
        GeneratorConstants.TAB_VARIABLES_VARIABLE,
      ];

      for (let v of nonExistentVars) {
        expect(modifiedContentOne.indexOf(v)).toEqual(-1);
        expect(modifiedContentTwo.indexOf(v)).toEqual(-1);
        expect(modifiedContentThree.indexOf(v)).toEqual(-1);
        expect(modifiedContentFour.indexOf(v)).toEqual(-1);
        expect(modifiedContentFive.indexOf(v)).toEqual(-1);
        expect(modifiedContentSix.indexOf(v)).toEqual(-1);
        expect(modifiedContentSeven.indexOf(v)).toEqual(-1);
      }
    });
  });

  describe('writeGeneratedFiles', () => {
    it('should return the list of files generated', () => {
      const map = new Map<string, string>();
      const templateDir = '/Users/noone/project/node_modules/ionic-angular/templates/component';
      const fileContent = 'SomeContent';
      const knownValues = ['html.tmpl', 'scss.tmpl', 'spec.ts.tmpl', 'ts.tmpl', 'module.tmpl'];
      const fileName = 'settings-view';
      const dirToWrite = join('/Users/noone/project/src/components', fileName);
      map.set(join(templateDir, knownValues[0]), fileContent);
      map.set(join(templateDir, knownValues[1]), fileContent);
      map.set(join(templateDir, knownValues[2]), fileContent);
      map.set(join(templateDir, knownValues[3]), fileContent);
      map.set(join(templateDir, knownValues[4]), fileContent);

      spyOn(helpers, helpers.mkDirpAsync.name).and.returnValue(Promise.resolve());
      spyOn(helpers, helpers.writeFileAsync.name).and.returnValue(Promise.resolve());

      const promise = util.writeGeneratedFiles({ dirToWrite: dirToWrite, fileName: fileName }, map);

      return promise.then((filesCreated: string[]) => {
        const fileExtensions = knownValues.map(knownValue => basename(knownValue, GeneratorConstants.KNOWN_FILE_EXTENSION));
        expect(filesCreated[0]).toEqual(join(dirToWrite, `${fileName}.${fileExtensions[0]}`));
        expect(filesCreated[1]).toEqual(join(dirToWrite, `${fileName}.${fileExtensions[1]}`));
        expect(filesCreated[2]).toEqual(join(dirToWrite, `${fileName}.${fileExtensions[2]}`));
        expect(filesCreated[3]).toEqual(join(dirToWrite, `${fileName}.${fileExtensions[3]}`));
        expect(filesCreated[4]).toEqual(join(dirToWrite, `${fileName}.${fileExtensions[4]}`));
      });
    });
  });

  describe('getDirToWriteToByType', () => {
    let context: any;
    const componentsDir = '/path/to/components';
    const directivesDir = '/path/to/directives';
    const pagesDir = '/path/to/pages';
    const pipesDir = '/path/to/pipes';
    const providersDir = '/path/to/providers';

    beforeEach(() => {
      context = { componentsDir, directivesDir, pagesDir, pipesDir, providersDir };
    });

    it('should return the appropriate components directory', () => {
      expect(util.getDirToWriteToByType(context, 'component')).toEqual(componentsDir);
    });

    it('should return the appropriate directives directory', () => {
      expect(util.getDirToWriteToByType(context, 'directive')).toEqual(directivesDir);
    });

    it('should return the appropriate pages directory', () => {
      expect(util.getDirToWriteToByType(context, 'page')).toEqual(pagesDir);
    });

    it('should return the appropriate pipes directory', () => {
      expect(util.getDirToWriteToByType(context, 'pipe')).toEqual(pipesDir);
    });

    it('should return the appropriate providers directory', () => {
      expect(util.getDirToWriteToByType(context, 'provider')).toEqual(providersDir);
    });

    it('should throw error upon unknown generator type', () => {
      expect(() => util.getDirToWriteToByType(context, 'dan')).toThrowError('Unknown Generator Type: dan');
    });
  });

  describe('getNgModules', () => {
    let context: any;
    const componentsDir = '/path/to/components';
    const directivesDir = '/path/to/directives';
    const pagesDir = '/path/to/pages';
    const pipesDir = '/path/to/pipes';
    const providersDir = '/path/to/providers';

    beforeEach(() => {
      context = { componentsDir, directivesDir, pagesDir, pipesDir, providersDir };
    });

    it('should return an empty list of glob results', () => {
      const globAllSpy = spyOn(globUtils, globUtils.globAll.name);
      util.getNgModules(context, []);
      expect(globAllSpy).toHaveBeenCalledWith([]);
    });

    it('should return a list of glob results for components', () => {
      const globAllSpy = spyOn(globUtils, globUtils.globAll.name);
      spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue('.module.ts');
      util.getNgModules(context, ['component']);
      expect(globAllSpy).toHaveBeenCalledWith(['/path/to/components/**/*.module.ts']);
    });

    it('should return a list of glob results for pages and components', () => {
      const globAllSpy = spyOn(globUtils, globUtils.globAll.name);
      spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue('.module.ts');
      util.getNgModules(context, ['page', 'component']);
      expect(globAllSpy).toHaveBeenCalledWith(['/path/to/pages/**/*.module.ts', '/path/to/components/**/*.module.ts']);
    });
  });

  describe('tabsModuleManipulation' , () => {
    const className = 'SettingsView';
    const fileName = 'settings-view';
    const suppliedName = 'settings view';

    it('should return a succesful promise', () => {
      spyOn(helpers, helpers.readFileAsync.name).and.returnValue(Promise.resolve('file content'));
      spyOn(fs, 'readdirSync').and.returnValue([
        join(process.cwd(), 'path', 'to', 'nowhere'),
        join(process.cwd(), 'path', 'to', 'somewhere'),
      ]);
      spyOn(helpers, helpers.writeFileAsync.name).and.returnValue(Promise.resolve());
      spyOn(TypeScriptUtils, TypeScriptUtils.insertNamedImportIfNeeded.name).and.returnValue('file content');
      spyOn(TypeScriptUtils, TypeScriptUtils.appendNgModuleDeclaration.name).and.returnValue('sliced string');

      const promise = util.tabsModuleManipulation([['/src/pages/cool-tab-one/cool-tab-one.module.ts']], { name: suppliedName, className: className, fileName: fileName }, [{ name: suppliedName, className: className, fileName: fileName }]);

      return promise.then(() => {
        expect(helpers.readFileAsync).toHaveBeenCalled();
        expect(helpers.writeFileAsync).toHaveBeenCalled();
      });
    });

    it('should throw when files are not written succesfully', () => {
      /*spyOn(helpers, helpers.writeFileAsync.name).and.throwError;

      expect(util.tabsModuleManipulation([['/src/pages/cool-tab-one/cool-tab-one.module.ts']], { name: suppliedName, className: className, fileName: fileName }, [{ name: suppliedName, className: className, fileName: fileName }])).toThrow();
      */
      // This test is not working correctly, it should look more like this below
      /*
      const knownErrorMsg = 'some known error';
      spyOn(helpers, helpers.writeFileAsync.name).and.returnValue(Promise.reject(new Error(knownErrorMsg)));

      const promise = util.tabsModuleManipulation([['/src/pages/cool-tab-one/cool-tab-one.module.ts']], { name: suppliedName, className: className, fileName: fileName }, [{ name: suppliedName, className: className, fileName: fileName }]);
      return promise.then(() => {
        throw new Error('should never happen');
      }).catch((err: Error) => {
        expect(err.message).toEqual(knownErrorMsg);
      });
    });
    */
  });

  describe('nonPageFileManipulation', () => {
    const componentsDir = '/path/to/components';
    const directivesDir = '/path/to/directives';
    const pagesDir = '/path/to/pages';
    const pipesDir = '/path/to/pipes';
    const providersDir = '/path/to/providers';

    const context = { componentsDir, directivesDir, pagesDir, pipesDir, providersDir };

    beforeEach(() => {
      const templateDir = '/Users/noone/project/node_modules/ionic-angular/templates';
      spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(templateDir);
    });

    it('should return a succesful promise', () => {
      // set up spies
      spyOn(helpers, helpers.readFileAsync.name).and.returnValue(Promise.resolve('file content'));
      spyOn(fs, 'readdirSync').and.returnValue([
        '/path/to/nowhere',
        'path/to/somewhere'
      ]);
      spyOn(helpers, helpers.writeFileAsync.name).and.returnValue(Promise.resolve());
      spyOn(helpers, helpers.mkDirpAsync.name).and.returnValue(Promise.resolve());
      spyOn(TypeScriptUtils, TypeScriptUtils.insertNamedImportIfNeeded.name).and.returnValue('file content');
      spyOn(TypeScriptUtils, TypeScriptUtils.appendNgModuleDeclaration.name).and.returnValue('sliced string');

      // what we want to test
      const promise = util.nonPageFileManipulation(context, 'coolStuff', '/src/pages/cool-tab-one/cool-tab-one.module.ts', 'pipe');

      // test
      return promise.then(() => {
        expect(helpers.readFileAsync).toHaveBeenCalled();
        expect(helpers.writeFileAsync).toHaveBeenCalled();
        expect(helpers.mkDirpAsync).toHaveBeenCalled();
      });
    });

    it('should throw when files are not written succesfully', () => {
      /*spyOn(helpers, helpers.writeFileAsync.name).and.throwError;

      expect().toThrow();
      */
      // This above test is likely not working correctly
      // it should look more like this
      /*
      const knownErrorMsg = 'some error';
      spyOn(helpers, helpers.writeFileAsync.name).and.returnValue(Promise.reject(new Error(knownErrorMsg)));
      const promise = util.nonPageFileManipulation(context, 'coolStuff', join('src', 'pages', 'cool-tab-one', 'cool-tab-one.module.ts'), 'pipe');
      return promise.then(() => {
        throw new Error('should never happen');
      }).catch((err: Error) => {
        expect(err.message).toEqual(knownErrorMsg);
      });
      */
    });
  });
});
