# Outstream VertaMedia Ad Player
Outstream VertaMedia Ad Player is a plug-in for playback of commercial video on the page.
Please, take into account, that after initialization of the player, video playback is started automatically

## Install
Include js file to
```HTML
    <script type="text/javascript" src="/path/to/lib/dist/outstream.js"></script>
```

## Initialization:

You can initialize this Ad Player in two ways:
 * by adding HTML markup to your page layout
 * directly by creating an Outstream object in your JS application

### Adding HTML markup
 Add `script tag` anywhere to the page layout.

Example:
```HTML

  <script data-outstream-aid="13694" data-outstream-width="400" data-outstream-mode="flash js" data-outstream-height="300" src="dist/outstream.js"></script>
```
You are able to customize a player to suit your needs. Please, use the attribute `data-outstream-` for redefining options by default.
List of available [*Player options*](#user-content-player-options) are presented below.

### Adding HTML markup
As soon as you've got all files downloaded and included in your page you just need to call constructor:
```javascript
  new Outstream({
      aid: 13694,
      width: 400,
      height: 300,
      VPAIDMode: ['flash', 'js']
      containerEl: document.getElementById('ad-container')
  })
```
List of available [*Player options*](#user-content-player-options) are presented below:

### Player options:
<md-table-container>
  <table md-table>
    <thead md-head >
      <tr md-row>
        <th md-column> Constructor parameter/type </th>
        <th md-column> Tag parameter </th>
        <th md-column> Default value </th>
        <th md-column> Description </th>
      </tr>
    </thead>
    <tbody md-body>
      <tr md-row >
        <td md-cell> aid:number </td>
        <td md-cell> data-outstream-aid </td>
        <td md-cell> </td>
        <td md-cell> User's aid for play Ads </td>
      </tr>
      <tr md-row >
        <td md-cell> width:number </td>
        <td md-cell> data-outstream-width </td>
        <td md-cell> 400 </td>
        <td md-cell> Width for outstream container </td>
      </tr>
      <tr md-row >
        <td md-cell> height:number </td>
        <td md-cell> data-outstream-height </td>
        <td md-cell> 400 </td>
        <td md-cell> Height for outstream container </td>
      </tr>
      <tr md-row >
        <td md-cell> containerEl:DOM object </td>
        <td md-cell> none </td>
        <td md-cell>  </td>
        <td md-cell> DOM element should be presented and contain an unique identifier. Example `<div id="ad-container"></div>` </td>
      </tr>
      <tr md-row >
        <td md-cell> isSSP:boolean </td>
        <td md-cell> data-outstream-SSP </td>
        <td md-cell>  </td>
        <td md-cell> Options for selection: vast.vertamedia.com (SSP account) or vast.videe.tv <br>
        (Videe.TV account (is used by default)) </td>
      </tr>
      <tr md-row >
        <td md-cell> VPAIDMode:array </td>
        <td md-cell> data-outstream-mode </td>
        <td md-cell>  </td>
        <td md-cell>
        Used for set of the VPAID mode. Options are: ['js'] or ['flash]. <br>
        If some mode is not supported by browser it possible <br>
        to set stack of modes. When one mode is not supported it <br>
        will be use next from stack ['js','flash'] or ['flash','js].<br>
        Custom stack is ['flash','js]. When tag parameter used -<br>
        for separation of modes space should be used 
        </td>
      </tr>
    </tbody>
  </table>
</md-table-container>

## Events:

<md-table-container>
  <table md-table>
    <thead md-head >
      <tr md-row>
        <th md-column> Event Name </th>
        <th md-column> Description </th>
      </tr>
    </thead>
    <tbody md-body>
      <tr md-row >
        <td md-cell> loaded </td>
        <td md-cell> On ad is loaded </td>
      </tr>
      <tr md-row >
        <td md-cell> error</td>
        <td md-cell> On ad has some error</td>
      </tr>
      <tr md-row >
        <td md-cell> impression</td>
        <td md-cell> On ad impression event (only for jsVPAID)</td>
      </tr>
       <tr md-row >
        <td md-cell> complete </td>
        <td md-cell> On finish play ad </td>
      </tr>
      <tr md-row >
        <td md-cell> started </td>
        <td md-cell> On ad start play </td>
      </tr>
       <tr md-row >
        <td md-cell> resumed </td>
        <td md-cell> on resumes the current ad </td>
      </tr>
       <tr md-row >
        <td md-cell> paused </td>
        <td md-cell> On ad is paused </td>
      </tr>
      <tr md-row >
        <td md-cell> mute </td>
        <td md-cell> On ad volume muted </td>
      </tr>
      <tr md-row >
        <td md-cell> unmute </td>
        <td md-cell> On ad volume unmuted </td>
      </tr>
    </tbody>
  </table>
</md-table-container>

```javascript
    var outstream = new Outstream({
         // some settings here ...
    })

    outstream.on('load',function(){
        // code ...
    });
```
## Methods:

### on()
 Subscribe for Outstream event

### off()
 Unsubscribe from Outstream event

### destroy()
 Destroy Outstream containerEl content

### startAd()
 Starts playing Ads

### stopAd()
 Stops playing Ads

### mute()
 Mutes Ads

### unmute()
 Unmutes Ads

### skipAd()
 Skips Ad which currently plays

### getAdVolume()
 Returns volume value

### setAdVolume(val)
 Sets Ads playing volume. Value`s parameter: from 0 to 1

### pauseAd()
 Stops playing Ads

### resumeAd()
 Resumes playing Ads

### resizeAd(width : Number, height : Number, viewMode : String)
 Sets new size for Ads view

## Flash mode is supported :
 IE from ie7<br>
 Chrome<br>
 FireFox<br>
 Safari

## JS mode is supported :
 IE from ie9<br>
 Chrome<br>
 FireFox<br>
 Safari
