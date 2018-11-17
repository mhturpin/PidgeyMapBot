## Description

> Pidgey has an extremely sharp sense of direction. It is capable of unerringly returning home to its nest, however far it may be removed from its familiar surroundings.

This is a map bot I have adapted from a project by bragef <https://github.com/bragef/pidgey>.
It shows a google maps link for a pokestop

It will take a JSON file with pois (gyms, pokestops, portals) and make
this searchable through discord. It will *not* help you assemble this
file, it assumes you already have a list of pois which you want to
make searchable.


## Install and configuration

Checkout the git.

Run npm install to install the dependencies.

Create a config.json, using config.json-dist as a template.


| Parameter | Description |
| --- | --- |
| token |  Discord bot token. See  https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token |
| command | Map command |
| google_api_key | Google static map api key https://developers.google.com/maps/documentation/maps-static/intro |
| poifile | JSON file with pois. See data/poi.json-sample for format. |
