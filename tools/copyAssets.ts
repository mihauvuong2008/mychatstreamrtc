import * as shell from "shelljs";

// Copy all the view templates
shell.cp( "-R", "src/views", "dist/" );
// Copy config
shell.cp( "-R", "src/config/config.json", "dist/config" );
