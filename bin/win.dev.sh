#!/bin/sh

clear
$CURRENTDIR=$(pwd)

NAME=reduced-dark-ui
PROJECT_DIR=$(pwd)/../$NAME

# RETURNVAL=$(node -e "require('$PROJECT_DIR/bin/run.js')" $NAME)
# echo $RETURNVAL
# exit 1;

echo "Navigating to the project root $PROJECT_DIR"
cd $PROJECT_DIR

echo "Unlinking the package $NAME"
apm unlink $PROJECT_DIR
apm unlink $PROJECT_DIR --dev

echo "Linking the package $NAME as a dev pkg"
apm link $PROJECT_DIR --dev

echo "Launching atom in development mode for the project $NAME"
atom --dev $PROJECT_DIR
