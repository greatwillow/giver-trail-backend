var Elevation = require('googlemapsutil').Elevation;
elevation = new Elevation();

var geTtheElevation = (geometry, Thecallback) => {
    //  console.log('inside get the elevation ')
    var finishedElevation = (data) => {
        // console.log('in finished elevation data is ', data)
        // console.log('calling the callback to store the elevation into the object ')
        Thecallback(data);
    }
    var getAnElevation = (callback) => {
        // console.log('inside get An elevation')
        getElevation(geometry, (data) => {
            // console.log('data coming back from getElevation function', data.results[0].elevation);

            // console.log('elevation from my call back', trail.geometry.elevation);
            // console.log('calling callback ', index)
            // console.log('before going to finishedElevation ')
            //console.log('data inside : ', data)
            callback(data);
        });
    }

    getAnElevation(finishedElevation);

}

getElevation = (modifiedResults, cb) => {
    elevation.locations(modifiedResults, null, (err, result) => {
        if (err) {
            console.log(err);
        }

        let obj = JSON.parse(result);
        //console.log('elevation object ', obj)
        cb(obj);

        //  console.log('elevation data in database : ', dbelev);

        // console.log('elevation data in database : ', trail.geometry.elevation[0]);
    });
}

module.exports = {
    geTtheElevation

}