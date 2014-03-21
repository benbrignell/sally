#!/bin/bash

#Check dependencies
command -v jekyll >/dev/null 2>&1 || { echo "I require jekyll but it's not installed (sudo gem install jekyll). Aborting." >&2; exit 1; }
#check for java
#command -v less >/dev/null 2>&1 || { echo "I require java for minifying js but it's not installed. Aborting." >&2; exit 1; }
#check for closure compiler, get if missing.
#if [[ -e compiler.jar ]]; then
#	echo "closure compiler jar found! - good"
#else 
#	echo "getting the closure compiler jar from our s3 account! - ok"
#	s3cmd get s3://importio-closure-compiler/compiler.jar
#fi	

read -d '' help <<"EOF"
.
    _                            __    _     
   (_)___ ___  ____  ____  _____/ /_  (_)___ 
  / / __ `__ \\/ __ \\/ __ \\/ ___/ __/ / / __ \\
 / / / / / / / /_/ / /_/ / /  / /__ / / /_/ /
/_/_/ /_/ /_/ .___/\\____/_/   \\__(_)_/\\____/ 
           /_/                               
import.io build script

Options:
	If no options specified just builds the project

	-h	Show this help dialog and exit
	-c	clean project
	-p	package for s3
	-u	uploads to s3 (implies -p)
EOF

do_clean=0
do_package=0
do_upload=0

while getopts ":hcpu" opt; do
	case $opt in
		c)
			do_clean=1
			;;
		h)
			echo "$help"
			exit 0
			;;
		p)
			do_package=1
			;;
		u)
			do_upload=1
			do_package=1
			;;
	esac
done

if [[ "$do_clean" -eq 1 ]]
then
	rm -rf _site
fi

#Exit script on first error.
set -o errexit

#Do the build
jekyll build

upload () {

	#set -x

	#stripping any preceeding ./
	FILE=`echo $1 | sed "s|^\./||"`
	S3_TARGET=$2

	echo "uploading $FILE to here $S3_TARGET/$FILE"
	FILE_EXTENSION=`echo $FILE | sed 's/.*\.//'`
	case "$FILE_EXTENSION" in
	"css")
		CONTENT_TYPE="text/css"
	    ;;
	"woff")
		CONTENT_TYPE="application/font-woff"
	    ;;
	"properties")
		CONTENT_TYPE="text/plain"
	    ;;	    
	"js")
		CONTENT_TYPE="text/javascript"
	    ;;	    
	*)
		CONTENT_TYPE=`file --mime-type $1 | sed "s/.*:\s//"`
	    ;;
	esac
	s3cmd --add-header='Cache-Control: public, max-age=31536000' -m $CONTENT_TYPE put "$FILE" "$S3_TARGET/$FILE"
}
export -f upload



if [[ "$do_package" -eq 1 ]]
then

	if [[ -z $BUILD_NUMBER ]] #this is a hudson env variable
	then
		BUILD_NUMBER="DEV4" 
	fi
	echo "BUILD_NUMBER is:- $BUILD_NUMBER"
	#TODO:- change to CDN!
	RESOURCE_TARGET="//d3sgt82prjfpwv.cloudfront.net/website/$BUILD_NUMBER"
	S3_TARGET="s3://importio-static-sites/website/$BUILD_NUMBER"

	# fix-up function
	fix-up () {

		HTML_TARGET=$1
		echo "fixing up:- $HTML_TARGET"
		RESOURCE_TARGET=$2
		#make sed safe
		RESOURCE_TARGET_SED=$(echo $RESOURCE_TARGET | sed -e 's/\\/\\\\/g' -e 's/\//\\\//g' -e 's/&/\\\&/g')

		# For example:-
		# 
		# <link href="/css/header.css" rel="stylesheet"> => <link rel="stylesheet" href="RESOURCE_TARGET/css/index.css">
		# <script src="/js/blah.js"> => <script src="RESOURCE_TARGET/js/blah.js">
		# <img src="../img/laptop-search.png" alt=""> => <img src="RESOURCE_TARGET/img/laptop-search.png" alt="">
		# <img src="../img/laptop-search.png" alt=""> => <img src="RESOURCE_TARGET/img/laptop-search.png" alt="">
		# 
		sed -i "s/href=\"\/css\//href=\"$RESOURCE_TARGET_SED\/css\//g" $HTML_TARGET

		#HAAACK - do this to avoid the next sed, and then put back
		sed -i "s/src=\"\/js\/config\/config.js/src=\"CONFIGJS/g" $HTML_TARGET
		#all other js
		sed -i "s/src=\"\/js\//src=\"$RESOURCE_TARGET_SED\/js\//g" $HTML_TARGET
		#put back - HAAACK over
		sed -i "s/src=\"CONFIGJS/src=\"\/js\/config\/config.js/g" $HTML_TARGET
		sed -i "s/src=\"\(..\/\)*img\//src=\"$RESOURCE_TARGET_SED\/img\//g" $HTML_TARGET
		sed -i "s/src=\"\/img\//src=\"$RESOURCE_TARGET_SED\/img\//g" $HTML_TARGET
		sed -i "s/url(\/img/url($RESOURCE_TARGET_SED\/img/g" $HTML_TARGET

	}
	#so i can use it in the find below
	export -f fix-up

	pushd _site
		find . -name "*.html" -exec bash -c 'fix-up "$0" $1' {} $RESOURCE_TARGET \; 
		find . -name "*.css" -exec bash -c 'fix-up "$0" $1' {} $RESOURCE_TARGET \; 
	popd

	if [[ "$do_upload" -eq 1 ]]
	then
		pushd _site
			find . -type f -exec bash -c 'upload "$0" $1' {} $S3_TARGET \; 
		popd
	fi
fi
