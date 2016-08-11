/**
 * @file  MDSrv
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


/* copied from ngl/src/utils.js*/

function getFileInfo( file ){

    var compressedExtList = [ "gz" ];

    var path, compressed, protocol;

    if( ( self.File && file instanceof File ) ||
        ( self.Blob && file instanceof self.Blob )
    ){
        path = file.name || "";
    }else{
        path = file;
    }
    var queryIndex = path.lastIndexOf( '?' );
    path = path.substring( 0, queryIndex === -1 ? path.length : queryIndex );

    var name = path.replace( /^.*[\\\/]/, '' );
    var base = name.substring( 0, name.lastIndexOf( '.' ) );

    var nameSplit = name.split( '.' );
    var ext = nameSplit.length > 1 ? nameSplit.pop().toLowerCase() : "";

    var protocolMatch = path.match( /^(.+):\/\/(.+)$/ );
    if( protocolMatch ){
        protocol = protocolMatch[ 1 ].toLowerCase();
        path = protocolMatch[ 2 ];
    }

    var dir = path.substring( 0, path.lastIndexOf( '/' ) + 1 );

    if( compressedExtList.indexOf( ext ) !== -1 ){
        compressed = ext;
        var n = path.length - ext.length - 1;
        ext = path.substr( 0, n ).split( '.' ).pop().toLowerCase();
        var m = base.length - ext.length - 1;
        base = base.substr( 0, m );
    }else{
        compressed = false;
    }

    return {
        "path": path,
        "name": name,
        "ext": ext,
        "base": base,
        "dir": dir,
        "compressed": compressed,
        "protocol": protocol,
        "src": file
    };

}


var MdsrvDatasource = function( baseUrl ){

    baseUrl = baseUrl || "";

    this.getListing = function( path ){
        path = path || "";
        var url = baseUrl + "dir/" + path;
        return NGL.autoLoad( url, {
            ext: "json", noWorker: true
        } ).then( function( jsonData ){
            return {
                path: path,
                data: jsonData.data
            };
        } );
    };

    this.getUrl = function( src ){
        console.log('src', src);
        var info = getFileInfo( src );
        return baseUrl + "file/" + info.path;
    };

    this.getNumframesUrl = function( src ){
        var info = getFileInfo( src );
        return baseUrl + "traj/numframes/" + info.path;
    };

    this.getFrameUrl = function( src, frameIndex ){
        var info = getFileInfo( src );
        return baseUrl + "traj/frame/" + frameIndex + "/" + info.path;
    };

    this.getFrameParams = function( src, atomIndices ){
        var info = getFileInfo( src );
        return "atomIndices=" + atomIndices.join(";");
    };

    this.getPathUrl = function( src, atomIndex ){
        var info = getFileInfo( src );
        return baseUrl + "traj/path/" + atomIndex + "/" + info.path;
    };

};
