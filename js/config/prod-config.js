/**
 * Configuration object
 * Passed to importio.init
 * Also used throughout code to handle configuration
 * 
 * This object should be setup for dev and then modified by build for other environments
 * 
 * @type {Object}
 */
var ioconfig = {};
// Host of the importio query host
ioconfig.host = "import.io";
// Whether to use https when querying.
ioconfig.https=true;
// Use random host prefix
ioconfig.randomHost=true;
// UI endpoint
ioconfig.ui = "http://import.io";

ioconfig.downloads = [
  {
    "platform": "Windows",
    "match": "^Win",
    "url": "https://d24s8iufolpmlr.cloudfront.net/prod/dist/setup.exe"
  },
  {
    "platform": "OS X",
    "match": "^Mac",
    "url": "https://d24s8iufolpmlr.cloudfront.net/prod/dist/import.io.dmg"
  },
  {
   "platform": "Linux",
   "match": "Linux (i686|x86|x86_64)$",
   "url": "https://d24s8iufolpmlr.cloudfront.net/prod/dist/32bit/import.io.tar.gz"
 }//,
 // {
 //   "platform": "Linux 64-bit",
 //   "match": "Linux x86_64",
 //   "url": "https://d24s8iufolpmlr.cloudfront.net/prod/dist/64bit/import.io.tar.gz"
 // }
]