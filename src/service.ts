import * as process from 'process';
// tslint:disable-next-line:no-implicit-dependencies
import * as ts from 'typescript'; // import for types alone
import { CancellationToken } from './CancellationToken';
import { NormalizedMessage } from './NormalizedMessage';
import { IncrementalBuilderInterface } from './IncrementalBuilderInterface';
import { ApiIncrementalBuilder } from './ApiIncrementalBuilder';

const typescript: typeof ts = require(process.env.TYPESCRIPT_PATH!);

const builder: IncrementalBuilderInterface = new ApiIncrementalBuilder(
  typescript,
  process.env.TSCONFIG!,
  JSON.parse(process.env.COMPILER_OPTIONS!)
);

async function run(cancellationToken: CancellationToken) {
  let diagnostics: NormalizedMessage[] = [];
  builder.nextIteration();

  try {
    diagnostics = await builder.getDiagnostics(cancellationToken);
  } catch (error) {
    if (error instanceof typescript.OperationCanceledException) {
      return;
    }

    throw error;
  }

  if (!cancellationToken.isCancellationRequested()) {
    try {
      process.send!({
        diagnostics
      });
    } catch (e) {
      // channel closed...
      process.exit();
    }
  }
}

process.on('message', message => {
  run(CancellationToken.createFromJSON(typescript, message));
});

process.on('SIGINT', () => {
  process.exit();
});
