import { defineConfig } from 'tsup';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	target: 'node20',
	platform: 'node',
	outDir: 'dist',
	clean: true,
	bundle: true,
	noExternal: [/(.*)/], // Bundle all dependencies
	splitting: false,
	sourcemap: true,
	minify: false,
	onSuccess: async () => {
		console.log('Build successful. Copying files and zipping...');

		// Copy files
		const filesToCopy = ['serverless.yml', 'package.json', 'pnpm-lock.yaml'];

		for (const file of filesToCopy) {
			if (fs.existsSync(file)) {
				fs.copyFileSync(file, path.join('dist', file));
				console.log(`Copied ${file} to dist`);
			} else {
				console.warn(`Warning: ${file} not found`);
			}
		}

		// Zip
		try {
			// Ensure zip is installed or use node native zip if preferred.
			// Assuming 'zip' is available in the environment as per previous conversation.
			execSync('cd dist && zip -r ../sao-geraldo-forms-lambda-dist.zip .');
			console.log('Created sao-geraldo-forms-lambda-dist.zip');
		} catch (error) {
			console.error('Error creating zip:', error);
		}
	},
});
