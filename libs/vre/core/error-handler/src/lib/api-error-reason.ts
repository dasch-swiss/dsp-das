/**
 * The server's own account of a failure, read out of whichever field carries it.
 *
 * dsp-api answers in more than one shape: the JSON-LD `knora-api:error` of the v2 endpoints, the
 * `{ message }` of the exceptions declared in the OpenAPI spec (`ConflictException`,
 * `NotFoundException`, …), an `{ error }`, or a bare string body.
 *
 * Shared by the snackbar and the telemetry payload deliberately. Keeping two narrower copies of this
 * precedence is what let a 409 report its reason to Sentry while telling the user to contact support
 * (DEV-6872).
 */
export function reasonFromErrorBody(body: unknown): string | undefined {
  if (typeof body === 'string') {
    return body || undefined;
  }

  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const shape = body as { 'knora-api:error'?: unknown; message?: unknown; error?: unknown };
  return [shape['knora-api:error'], shape.message, shape.error].find(
    (candidate): candidate is string => typeof candidate === 'string' && candidate.length > 0
  );
}
