// Single source of truth for account deletion. Used by the Edge Function that
// serves both the Android app and the public web page. Contains no Deno-only
// APIs so it can be unit tested with Node.

export const STORAGE_BUCKET = 'documents';
export const STORAGE_PREFIX = 'vehicle-documents';

export class DeletionError extends Error {
  step: string;
  constructor(step: string, cause: unknown) {
    super(`Account deletion failed at step "${step}".`);
    this.step = step;
    this.cause = cause;
  }
}

// deno-lint-ignore no-explicit-any
type AdminClient = any;

export type DeletableUser = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
};

const isNotFound = (error: { message?: string; status?: number; code?: string } | null) => {
  if (!error) return false;
  const message = String(error.message || '').toLowerCase();
  return error.status === 404 || error.code === 'user_not_found' || message.includes('not found');
};

// Extracts "vehicle-documents/..." from a Supabase Storage public URL.
export const storagePathFromUrl = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const index = value.indexOf(marker);
  if (index === -1) return null;

  let path: string;
  try {
    path = decodeURIComponent(value.slice(index + marker.length).split('?')[0]);
  } catch {
    return null;
  }

  const segments = path.split('/');
  if (segments[0] !== STORAGE_PREFIX || segments.some((segment) => segment === '..' || segment === '')) {
    return null;
  }
  return path;
};

const listFiles = async (admin: AdminClient, prefix: string) => {
  const queue = [prefix];
  const files: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift() as string;
    const pageSize = 1000;
    let offset = 0;

    while (true) {
      const { data, error } = await admin.storage.from(STORAGE_BUCKET).list(current, {
        limit: pageSize,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (error) {
        if (isNotFound(error)) break;
        throw error;
      }

      const page = data || [];
      for (const item of page) {
        const fullPath = `${current}/${item.name}`;
        if (item?.metadata) files.push(fullPath);
        else queue.push(fullPath);
      }

      if (page.length < pageSize) break;
      offset += page.length;
    }
  }

  return files;
};

const removeFiles = async (admin: AdminClient, paths: string[]) => {
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await admin.storage.from(STORAGE_BUCKET).remove(paths.slice(i, i + 100));
    if (error) throw error;
  }
};

const step = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    throw new DeletionError(name, error);
  }
};

const mustSucceed = <T extends { error: unknown }>(result: T): T => {
  if (result.error) throw result.error;
  return result;
};

// Deletes everything owned by `user`, ending with the Auth user itself. Every
// step is idempotent, so a failed or interrupted request can simply be retried.
// Only the verified user id, and the email only when confirmed, identify data:
// nothing supplied by the client is used.
export const deleteAccount = async (admin: AdminClient, user: DeletableUser) => {
  const email = user.email && user.email_confirmed_at ? user.email : null;
  const filePaths = new Set<string>();

  const drivers = await step('read_drivers', async () => {
    const { data } = mustSucceed(await admin.from('drivers').select('selfie').eq('userid', user.id));
    return data || [];
  });
  for (const row of drivers) {
    const path = storagePathFromUrl(row.selfie);
    if (path) filePaths.add(path);
  }

  const vehicles = email
    ? await step('read_vehicles', async () => {
        const { data } = mustSucceed(
          await admin
            .from('vehicles')
            .select('left_img,right_img,registration_front,registration_back')
            .eq('signeddriveremail', email),
        );
        return data || [];
      })
    : [];
  for (const row of vehicles) {
    for (const column of ['left_img', 'right_img', 'registration_front', 'registration_back']) {
      const path = storagePathFromUrl(row[column]);
      if (path) filePaths.add(path);
    }
  }

  await step('storage', async () => {
    if (email) {
      for (const path of await listFiles(admin, `${STORAGE_PREFIX}/${email}`)) filePaths.add(path);
    }
    await removeFiles(admin, [...filePaths]);
  });

  // Vehicles belong to the fleet: release them instead of deleting the fleet's record.
  if (email) {
    await step('release_vehicles', async () => {
      mustSucceed(
        await admin
          .from('vehicles')
          .update({
            signeddriveremail: null,
            left_img: null,
            right_img: null,
            registration_front: null,
            registration_back: null,
            used: false,
          })
          .eq('signeddriveremail', email),
      );
    });

    await step('contracts', async () => {
      mustSucceed(await admin.from('fleet_signed_contracts').delete().eq('driver_email', email));
    });
  }

  await step('location_updates', async () => {
    mustSucceed(await admin.from('driver_location_updates').delete().eq('user_id', user.id));
    if (email) {
      mustSucceed(await admin.from('driver_location_updates').delete().eq('driver_email', email));
    }
  });

  await step('drivers', async () => {
    mustSucceed(await admin.from('drivers').delete().eq('userid', user.id));
    if (email) mustSucceed(await admin.from('drivers').delete().eq('email', email));
  });

  await step('auth_user', async () => {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    // Already gone means a previous attempt finished this step.
    if (error && !isNotFound(error)) throw error;
  });
};
