import { CancellationToken } from './CancellationToken';
import { NormalizedMessage } from './NormalizedMessage';

export interface IncrementalBuilderInterface {
  nextIteration(): void;

  getDiagnostics(
    cancellationToken: CancellationToken
  ): Promise<NormalizedMessage[]>;

  writeDeclaration(cancellationToken: CancellationToken): void;
}
