#!/bin/sh

NAME=reduced-dark-ui
PROJECT_DIR=~/Projects/Atom/$NAME

echo "Navigating to the project root $PROJECT_DIR"
cd $PROJECT_DIR

echo "Unlinking the package $NAME"
apm-beta unlink $PROJECT_DIR
apm-beta unlink $PROJECT_DIR --dev

echo "Linking the package $NAME as a dev pkg"
apm-beta link $PROJECT_DIR --dev

echo "Launching atom in development mode for the project $NAME"
atom-beta --dev $PROJECT_DIR
