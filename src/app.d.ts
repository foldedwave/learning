// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** The signed-in child, if any. Only ever their own data is read. */
			child: {
				id: number;
				displayName: string;
				avatar: string;
				yearGroup: number;
				settings: import('#lib/server/db/schema.ts').ChildSettings;
			} | null;
			/** True when the parent is signed in (previewing topics records nothing). */
			parent: boolean;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
