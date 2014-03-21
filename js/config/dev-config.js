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
ioconfig.host = "dev-owl.com";
// UI endpoint
ioconfig.ui = "https://dev-owl.com";

ioconfig.downloads = [
  {
    "platform": "Windows",
    "match": "^Win",
    "url": "https://d24s8iufolpmlr.cloudfront.net/dev/dist/setup.exe"
  },
  {
    "platform": "OS X",
    "match": "^Mac",
    "url": "https://d24s8iufolpmlr.cloudfront.net/dev/dist/import.io.dmg"
  },
  {
   "platform": "Linux",
   "match": "Linux (i686|x86|x86_64)$",
   "url": "https://d24s8iufolpmlr.cloudfront.net/dev/dist/32bit/import.io.tar.gz"
 }//,
 // {
 //   "platform": "Linux 64-bit",
 //   "match": "Linux x86_64",
 //   "url": "https://d24s8iufolpmlr.cloudfront.net/dev/dist/64bit/import.io.tar.gz"
 // }
]