#!/bin/bash

export FORCE_COLOR=1

npm run build -- --configPath $1

unset FORCE_COLOR

# if [[ $1 == *"mod.ts"* ]]; then
#   dist_file=`basename \`dirname "$1"\``
# else
#   dist_file=`basename "$1"`
#   dist_file=${dist_file%.*}
# fi

# echo "Copying \"$dist_file\" into clipboard"
# dist_path="`npm prefix`/dist/$dist_file.user.js"

# # clip.exe < $dist_path


