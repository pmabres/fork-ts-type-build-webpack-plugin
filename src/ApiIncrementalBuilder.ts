// tslint:disable-next-line:no-implicit-dependencies
import * as ts from 'typescript'; // Imported for types alone
// tslint:disable-next-line:no-implicit-dependencies
import { IncrementalBuilderInterface } from './IncrementalBuilderInterface';
import { CancellationToken } from './CancellationToken';
import { NormalizedMessage } from './NormalizedMessage';
import { CompilerHost } from './CompilerHost';
import { FsHelper } from './FsHelper';

// Need some augmentation here - linterOptions.exclude is not (yet) part of the official
// types for tslint.
export class ApiIncrementalBuilder implements IncrementalBuilderInterface {
  private readonly tsIncrementalCompiler: CompilerHost;
  private lastUpdatedFiles: string[] = [];

  constructor(
    typescript: typeof ts,
    programConfigFile: string,
    compilerOptions: ts.CompilerOptions
  ) {
    this.tsIncrementalCompiler = new CompilerHost(
      typescript,
      programConfigFile,
      compilerOptions
    );
  }

  public nextIteration() {
    // do nothing
  }

  public async getDiagnostics(_cancellationToken: CancellationToken) {
    const diagnostics = await this.tsIncrementalCompiler.processChanges();
    this.lastUpdatedFiles = diagnostics.updatedFiles;

    return NormalizedMessage.deduplicate(
      diagnostics.results.map(NormalizedMessage.createFromDiagnostic)
    );
  }

  public writeDeclaration(_cancellationToken: CancellationToken) {
    for (const updatedFile of this.lastUpdatedFiles) {
      try {
        // const source = fs.readFileSync(updatedFile, 'utf-8');
      } catch (e) {
        if (
          FsHelper.existsSync(updatedFile) &&
          // check the error type due to file system lag
          !(e instanceof Error) &&
          !(e.constructor.name === 'FatalError') &&
          !(e.message && e.message.trim().startsWith('Invalid source file'))
        ) {
          // it's not because file doesn't exist - throw error
          throw e;
        }
      }
    }
  }
}
