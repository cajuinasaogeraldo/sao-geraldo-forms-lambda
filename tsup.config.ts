import { defineConfig } from 'tsup';
import { cpSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from './lib/logger';

export default defineConfig({
	entry: ['index.ts'],
	format: ['cjs'],
	target: 'node20',
	minify: true,
	bundle: true,
	noExternal: [/.*/],
	external: ['aws-sdk'],
	outDir: 'dist',
	clean: true,
	sourcemap: false,

	async onSuccess() {
		// Copia templates para dist/templates
		const templatesSource = join('templates');
		const templatesDest = join('dist', 'templates');

		if (existsSync(templatesSource)) {
			cpSync(templatesSource, templatesDest, { recursive: true });
			logger.info('✓ Templates copiados para dist/templates');
		} else {
			console.warn('⚠ Pasta templates não encontrada');
		}
	},
});
