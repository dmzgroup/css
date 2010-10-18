#!/bin/sh
DEPTH=../../..
lmk -m opt -b
cp -RL $DEPTH/bin/macos-opt/CSS.app $DEPTH
mkdir $DEPTH/CSS.app/Contents/Frameworks/Qt
mkdir $DEPTH/CSS.app/Contents/Frameworks/Qt/plugins
mkdir $DEPTH/CSS.app/Contents/Frameworks/Qt/plugins/imageformats
mkdir $DEPTH/CSS.app/Contents/Frameworks/v8/
cp $DEPTH/depend/Qt/QtCore $DEPTH/CSS.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtGui $DEPTH/CSS.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtXml $DEPTH/CSS.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtSvg $DEPTH/CSS.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtOpenGL $DEPTH/CSS.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/imageformats/libqgif.dylib $DEPTH/CSS.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqjpeg.dylib $DEPTH/CSS.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqtiff.dylib $DEPTH/CSS.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqsvg.dylib $DEPTH/CSS.app/Contents/Frameworks/Qt/plugins/imageformats
if [ -d $DEPTH/depend/QtGui.framework/Versions/4/Resources/qt_menu.nib ] ; then
cp -R $DEPTH/depend/QtGui.framework/Versions/4/Resources/qt_menu.nib $DEPTH/CSS.app/Contents/Resources
fi
cp $DEPTH/depend/v8/lib/libv8.dylib $DEPTH/CSS.app/Contents/Frameworks/v8/
TARGET=$DEPTH/CSS-`cat $DEPTH/tmp/macos-opt/mbraapp/buildnumber.txt`.dmg
hdiutil create -srcfolder $DEPTH/CSS.app $TARGET
hdiutil internet-enable -yes -verbose $TARGET
rm -rf $DEPTH/CSS.app/
INSTALLER_PATH=$DEPTH/installers
if [ ! -d $INSTALLER_PATH ] ; then
   mkdir $INSTALLER_PATH
fi
mv $TARGET $INSTALLER_PATH
