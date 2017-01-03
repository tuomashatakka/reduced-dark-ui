#!/bin/sh

clear

NAME=reduced-dark-ui
PROJECT_DIR=~/Projects/Atom/$NAME

# RETURNVAL=$(node -e "require('$PROJECT_DIR/bin/run.js')" $NAME)
# echo $RETURNVAL
# exit 1;

echo "Navigating to the project root $PROJECT_DIR\n"
cd $PROJECT_DIR

echo "Unlinking the package $NAME\n"
apm-beta unlink $PROJECT_DIR
apm-beta unlink $PROJECT_DIR --dev

echo "Linking the package $NAME as a dev pkg\n"
apm-beta link $PROJECT_DIR --dev

echo "Launching atom in development mode for the project $NAME\n"
atom-beta --dev $PROJECT_DIR
