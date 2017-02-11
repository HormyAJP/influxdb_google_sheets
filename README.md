# What is this?

Simple Google Sheets plugin for fetching data from an InfluxDB instance and formatting it nicely. It exposes a single public function to the sheets `INFLUXQUERY`.

# How do I set it up?

* Create a spreadsheet. 
* Go to Tools->Script Editor.
* Copy paste code from influxdb.gs into the Code.gs file (rename Code.gs to whatever you want).
* Use the single public function `INFLUXQUERY` in your spreadsheet.

Alternatively you can use the example sheet here:

https://docs.google.com/spreadsheets/d/1YKK5jvsYSfO1yLWNlx9pnbLRgQc6o9KDcHddR8ep1hY/edit#gid=680551108

> WARNING: Assume that this sheet is not up to date. The single source of truth is this Git repo. I will try to keep the script in there in sync with the one in this repo but assume it's out of sync.

# How do I use the function?

It should be well documented with the inline docs (which pop-up during autocompletion). One useful thing to note is that if you set the `raw` parameter to `TRUE` then you'll see exactly what was returned by influx, which might be helpful in debugging.

# Why haven't you released this as an add-on for Google Sheets?

Partly I can't be bothered! However, Git is a much better way of tracking changes and handling feature requests.

# It doesn't work/it doesn't do what I want!

Let me know. I'm happy to improve it. Or send a pull request.

There's a finite limit to what it can sensibly do so I suspect it'll converge very quickly to a final form.
