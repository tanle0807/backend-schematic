#!/usr/bin/env sh

# abort on errors
set -e

# build

echo 'Vui lòng đợi build project'
yarn install
yarn run build
echo 'Đã build xong project !'
# navigate into the build output directory


rm -rf deploy
mkdir deploy
cp -r ./dist ./deploy/dist
cp -r ./package.json ./deploy/package.json

cd deploy

echo 'Kết nối git'
git init
git add -A
git commit -m 'deploy'

git push -f https://devteam@fclass.devteam.mobi/plesk-git/fclass.git master
cd -