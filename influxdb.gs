/**
 * Placeholder. No URL validation currently.
 * HTTP library should handle it.
 */
 function validateURL_(url)
 {
   return;
   //throw "Bad URL";
 }
 
 /**
  * Placeholder. No query validation currently.
  * Influx server should handle it.
  */
 function validateQuery_(query) {
   return;
   //throw "Bad Query";
 }
 
 /**
  * Create a full influx URL with query string.
  */
 function buildInfluxURL_(version, url, database, query, user, password)
 {
   if (version == 'v1')
   {
    url = url + "/query?";
    if (user && !password)
      throw "USER BUT NO PASSWORD"
    if (!user && password)
      throw "PASSWORD BUT NO USER"
  
    if (user)
    {
      url += "u=" + user;
      url += "&p=" + password;
    }
  
    url += "&db=" + database;
    url += "&q=" + encodeURIComponent(query);
    return url;
   }

   if (version == 'v2')
   {
    url = url + "/api/v2/query?";
    if (user && !password)
      throw "INFLUX_ORG_ID BUT NO INFLUX_TOKEN"
    if (!user && password)
      throw "INFLUX_TOKEN BUT NO INFLUX_ORG_ID"
    
    if (user)
    {
      url += "orgID=" + user;
    }

    return url;
   }
 }
 
 /**
  * Attempt to turn the data returned by influx into a format palatable
  * for a spreadsheet.
  * @param {json} data JSON response from InfluxDB.
  * @return Array of arrays, i.e. an array of rows.
  */
 function smartParseResponse_(data)
 {
   try
   {
     // First we do our own checks on what we expect the data to look like.
     if (data["results"].length == 0)
       throw "QUERY RETURNED NO RESULTS";
 
     // TODO: Is this necessary? It'll possibly mean we fail when handling multiple
     // series from a group by query.
     if (!("series" in data["results"][0]))
       throw "QUERY RETURNED NO SERIES";
 
     if (data["results"].length != 1)
       throw "EXPECTED EXACTLY 1 element in 'results' array'.";
 
     // Convenience variable as we assume only one results
     // TODO: Investigate when more than one result can occur. IIRC it's only going
     // to happen if you send multiple queries to the API so shouldn't affect us.
     var result = data["results"][0];
 
     var rows = [];
     for (var iSeries = 0; iSeries < result["series"].length; ++iSeries)
     {
       var series = result["series"][iSeries];
 
       // N.B. We ignore the series["name"] value. We could potentially use it but
       // I suspect it's just clutter.
 
       // We have tags if (and only if?) the query contains the 'group by' clause.
       if ("tags" in series)
       {
         var groupHeading = "Tags:";
         var tags = series["tags"];
         for (var tag in tags)
         {
           if (tags.hasOwnProperty(tag))
           {
             groupHeading += " ";
             groupHeading += tag;
             groupHeading += ": ";
             groupHeading += tags[tag];
           }
         }
         // Add a row with all the tags for this group
         rows.push(groupHeading);
       }
 
       // Add the headings of the data
       rows.push(series["columns"]);
 
       for (var iRow = 0; iRow < series["values"].length; ++iRow)
       {
         var row = [];
         for (var iCol = 0; iCol < series["columns"].length; ++iCol)
         {
           row.push(series["values"][iRow][iCol]);
         }
         rows.push(row);
       }
     }
     return rows;
   }
   catch(err)
   {
     throw "RETURNED DATA HAD UNEXPECTED FORMAT: You may need to enhance the script. Pass raw=TRUE to see the raw json returned by InfluxDB. Error was: " + err;
   }
 }
 
 /**
  * If the response code is not 200 from the passed reponse then
  * raise an exception with the most helpful message possible.
  */
 function checkResponse_(response)
 {
   if (response.getResponseCode() == 200)
     return
 
   var text = response.getContentText();
   if (text.indexOf("authentication failed") != -1)
     throw "BAD CREDENTIALS";
 
   var json = JSON.parse(text)
 
   if ("error" in json)
     throw "INFLUX ERROR: " + json["error"];
 
   throw "UNKNOWN ERROR: Http Response Code = " + response.getResponseCode()
         + ", Response = " + text;
 }
 
 /**
  * Run the Influx query and get the raw response from the server.
  */
 function runInfluxQuery_(version, url, token, query)
 {
 
   // We could just let this function throw but setting muteHttpExceptions
   // to true gives us the HTTPResponse object, which has more flexibility
   // for the future.
   if (version == 'v1')
   {
    var response = UrlFetchApp.fetch(url, {"muteHttpExceptions":true});
    checkResponse_(response);
    return JSON.parse(response.getContentText());
   }

   if (version == 'v2')
   {
    var headers = {
        'Authorization' : 'Token ' + token,
        'Accept' : 'application/csv',
        'Content-type': 'application/vnd.flux'
    };
    var option = {
        'method' : 'post',
        'headers' : headers,
        'payload' : query,
        'muteHttpExceptions' : true
    };
    var response = UrlFetchApp.fetch(url, option);
    return response.getContentText();
   }
   
 }
 
 /**
  * Helper function for enforcing use of an input parameter.
  */
 function parameterRequired_(name, value)
 {
     if (typeof(value) == "undefined")
       throw "'" + name + "' PARAMETER IS REQUIRED";
 }
 
 /**
  * Helper function for setting an input parameter to a default value if
  * it's not defined.
  */
 function parameterDefault_(current, _default)
 {
     if (typeof(current) == "undefined")
       return _default;
     else
       return current;
 }
 
 /**
  * Run a query on an InfluxDB and return parsed data.
  * @param {string} version The version of InfluxDB, v1 or v2
  * @param {string} url The base URL for the influxdb instance including
  * port, e.g. https://influx.my.company.com:8086.
  * @param {string} database The database to query from.
  * @param {string} query The InfluxDB query to run. Or Flux for v2.
  * @param {string} user User name if auth is required for v1. Use INFLUX_ORG_ID istead for v2.
  * @param {string} password Password if auth is required for v1. Use INFLUX_TOKEN istead for v2.
  * @param {string} raw Return raw json from Influx rather than trying to
  * parse it. Useful for debugging.
  * @return Results from the query or error message otherwise
  * @customfunction
  */
 function INFLUXQUERY(version, url, database, query, user, password, raw)
 {
   try
   {
     parameterRequired_("version", version); 
     parameterRequired_("url", url);
     parameterRequired_("query", query);
     user = parameterDefault_(user, false);
     password = parameterDefault_(password, false);
     raw = parameterDefault_(raw, false);
     database = parameterDefault_(database, false);
 
     validateURL_(url);
     validateQuery_(query);
     url = buildInfluxURL_(version, url, database, query, user, password);
     json = runInfluxQuery_(version, url, password, query);

     if(version == 'v2')
     {
         return json;
     }
 
     if (raw)
       return JSON.stringify(json);
     else
       return smartParseResponse_(json);
   }
   catch(err)
   {
     if (typeof(err) != "string")
       err = JSON.stringify(err);
     return "ERROR: " + err;
   }
 }