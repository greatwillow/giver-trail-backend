 const axios = require('axios');

 var geocode = (city, country, postalCode) => {


     console.log(`GeoCode address :${city}  ${country}  ${postalCode}`)

     var encodedAddress = encodeURIComponent(city + ' ' + country + ' ' + postalCode);
     console.log(`encoded : ${encodedAddress}`);

     var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;
     console.log(`url : ${url}`);
     return axios.get(url).then((response) => {
         if (response.data.status === 'ZERO_RESULTS') { console.log(`inside the error`); throw new Error('Unable to find that address. ') }

         var fullAddress = response.data.results[0].formatted_address;
         console.log(`full address : ${fullAddress}`);

         return response
     }).catch((err) => {
         if (error.code === 'ENOTFOUND')
             return `unable to coonect to API ${error.code}`;
         else
             return `there is an error ${error.message}`;
     });


 }


 module.exports = {
     geocode
 }