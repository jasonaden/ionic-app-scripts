import { Logger } from '../logger/logger';
import * as Constants from '../util/constants';
import { getStringPropertyValue } from '../util/helpers';
import { MagicString } from '../util/interfaces';

export function purgeDecorators(filePath: string, originalFileContent: string, instance: MagicString) {
  return purgeIndexDecorator(filePath, originalFileContent, instance);
}

export function purgeIndexDecorator(filePath: string, originalFileContent: string, instance: MagicString) {
  if (getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_ENTRY_POINT) === filePath) {
    Logger.debug(`Purging index file decorator for ${filePath}`);
    const DECORATORS_REGEX = getDecoratorRegex();
    const matches = DECORATORS_REGEX.exec(originalFileContent);
    if (matches && matches.length) {
      instance.overwrite(matches.index, matches.index + matches[0].length, '');
    }
  }
  return instance;
}

export function getDecoratorRegex() {
  return /IonicModule.decorators.=[\s\S\n]*?([\s\S\n]*?)];/igm;
}

export function removeTSickleClosureDeclarations(filePath: string, fileContent: string, ionicAngularDir: string, srcDir: string) {
  if (filePath.indexOf(ionicAngularDir) >= 0 || filePath.indexOf(srcDir) >= 0) {
    const tSickleClosureDeclarationRegex = getTSickleclosureDeclarationRegex();
    const matches = tSickleClosureDeclarationRegex.exec(fileContent);
    if (matches && matches.length) {
      return fileContent.replace(matches[0], `/*${matches[0]}*/`);
    }

  }
  return fileContent;
}

export function getTSickleclosureDeclarationRegex() {
  return /function.*?_tsickle_Closure_declarations[\S\s]*?[\s]}/gm;
}
