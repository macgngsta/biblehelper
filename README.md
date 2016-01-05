# BibleHelper
Web application to make reading the bible project plan more accessible.

http://bible.sograce.org

## Usage

 1. Get the current calendar.csv from http://bible.sograce.org/scripts/calendar.csv
 2. Goto Google Calendar. Create a new calendar
 3. Import the calendar.csv into the new calendar

## Structure

The webapp currently only has around 100 days loaded. I'll probably load the rest as time permits.
Only 2 translations are available: ESV and NASB - these are the only ones of significance provided by bibles.org 

ESV = 1
NASB = 2
~~NIV = 3~~

```/#/1/1``` - day 1 with ESV translation
```/#/5/2``` - day 5 with NASB translation


### Things of Interest

```js/plan_tbp.json``` - the plan in JSON format
```scripts/generateCal.php``` - will generate a calendar in csv format for Google import given a start date


## Premise
[Reality SF](http://realitysf.com) partnered with [The Bible Project](http://jointhebibleproject) last year to institute a new plan, Year of Biblical Literacy for 2016. Unfortunately as of writing this (Jan 2016) things are still new, vidoes have yet to be made, and the tools you would come to expect are not yet available. 

The plan requires a reading, prayer, and possibily watching a video every day in order to finish the whole bible in one year.

## Issues

Currently there are a few communication tools available. 

 1. [Pdfs of the plan](http://thebibleproject.tumblr.com/readscripture)
 2. [YouTube for the videos](https://www.jointhebibleproject.com/)
 3. Email notifications of new videos
 4. [iOS/Android app](https://www.facebook.com/jointhebibleproject/)

All the resources are in disparate places. In order to follow through for the day, one has to look at the pdf plan, figure out what passages to read, either use a bible or search online through a site, like [Biblegateway](http://biblegateway.com).

Enterprising Community Group leaders will proactively try to mash up the readings and plans into facebook groups or weekly google emails, but that can be tedious, cumbersome, and not sustainable.

## Solution

Use Google calendar to manage notifications (most people either have Google calendar, Outlook, or Apple Calendar), this product is pretty accessible for everyone. Create a quick responsive webapp (PHP, Twitter Boostrap, Javascript) to mashup the readings and videos.

## Design Tradeoffs

 * Google calendar does not allow proper linking (hrefs) in the description, organization would suffer if all the links were to be in the description. Luckily, Google has a csv import option, which would allow for pragmatic upload of events and has nice sharing options.
 * JSON instead of MySQL or RDBMS - mainly for speed to prototype and extensibility. I figured as a plan that continues to change, and there not being a "machine readable" version of the plan, it would be better
 * JQuery instead of Angular or Mustache or other frameworks - It's just what I know, and was easier to re-use and re-purpose existing code
 * straight PHP instead of Laravel or other PHP frameworks - hosting. currently on 1and1 and Laravel doesn't really play nice
 * [Bibles.org](http://bibles.org) - first google result with a decent API I could call to get passages. Open to suggestions on this one. For some reason they only have ESV and NASB, but not NIV or NLT

## Next Steps

 * Create caching for API calls
 * Move to MVC for the backend
 * build scripts
 * Some sort of testing 
 * Finish up the plan, possibly move to a RDBMS, create interface for other plans?