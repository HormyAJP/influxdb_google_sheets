# What is this?

Simple Google Sheets plugin for fetching data from an InfluxDB instance and formatting it nicely.
It exposes two public functions to the sheets: `INFLUXQUERYv1` and `INFLUXQUERYv2`. The former is 
for the old v1 Influx API and the latter for the v2 API.

> WARNING: The v1 API is no longer maintained and may not work any more.

# How do I set it up?

* Create a spreadsheet.
* Go to Tools->Script Editor.
* Copy paste code from influxdb.gs into the Code.gs file (rename Code.gs to whatever you want).
* Use the public functions in your spreadsheet.

Alternatively you can use the example sheet here:

https://docs.google.com/spreadsheets/d/1zNIjqrlEUKK7jdIsbF8LXHVNvPaDMZmkEfs4c_MuL14/edit?usp=sharing

> WARNING: Assume that this sheet is not up to date. The single source of truth is this Git repo. I
> will try to keep the script in there in sync with the one in this repo but assume it's out of sync.

# How do I use the function?

It should be well documented with the inline docs (which pop-up during autocompletion). 

# Why haven't you released this as an add-on for Google Sheets?

Partly I can't be bothered! However, Git is a much better way of tracking changes and handling
feature requests.

# It doesn't work/it doesn't do what I want!

Let me know. I'm happy to improve it. Or send a pull request.

There's a finite limit to what it can sensibly do so I suspect it'll converge very quickly to a
final form.

# Any quick tips for testing this?

* Install InfluxDB locally.
* Follow a tutorial to configure your DB and create a simple measurement.
* Use [ngrok](https://ngrok.com/) as a proxy to get a public URL for your DB instance.
* Populate the data in the test spreadsheet above.

