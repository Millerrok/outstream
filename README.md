# outstream
Outstream initer for VPAID unit

## Usage

### Auto initialization with `script tag` :
 Default size is `400 X 300`


 Add `script tag` anywhere to the page code.
 * It will add the generated `Outstream DOM element` before the `script tag` in DOM
 * If the `script tag` is added to the header, then the `Outstream DOM element` will be added to end of the `body`

`script tag` example:
```HTML
  <script data-outstream-aid="13694" data-outstream-width="400" data-outstream-height="300" src="dist/outstream.js"></script>
```

### By Constructor:
  You need to add script tag to the page code: `<script src="dist/outstream.js"></script>`
  First create a new DOM element. The created element will be used as the container for the generated `Outstream DOM element`. Then setup it up within the Outstream constructor.

 Usage:
```javascript
  new Outstream({
      aid: 13694,
      width: 400,
      height: 300,
      containerEl: document.getElementById('ad-container')
  })
```
## Description of outstream options:
<md-table-container>
  <table md-table>
    <thead md-head >
      <tr md-row>
        <th md-column> Constructor parameter/type </th>
        <th md-column> Tag parameter </th>
        <th md-column> Description </th>
      </tr>
    </thead>
    <tbody md-body>
      <tr md-row >
        <td md-cell> aid: number </td>
        <td md-cell> data-outstream-aid </td>
        <td md-cell> User`s aid for play Ads </td>
      </tr>
      <tr md-row >
        <td md-cell> width: number </td>
        <td md-cell> data-outstream-width </td>
        <td md-cell> Width for outstream container </td>
      </tr>
      <tr md-row >
        <td md-cell> height:number </td>
        <td md-cell> data-outstream-height </td>
        <td md-cell> Height for outstream container </td>
      </tr>
      <tr md-row >
        <td md-cell> containerEl: DOM object </td>
        <td md-cell> none </td>
        <td md-cell> Parent container for outstream DOM element </td>
      </tr>
      <tr md-row >
        <td md-cell> isSSP: boolean </td>
        <td md-cell> data-outstream-SSP </td>
        <td md-cell> Options for selection: vast.vertamedia.com (SSP account) or vast.videe.tv <br> (Videe.TV account (is used by default)) </td>
      </tr>
      <tr md-row >
        <td md-cell> VPAIDMode:array </td>
        <td md-cell> data-outstream-mode </td>
        <td md-cell> Used for set of the VPAID mode. Options are: ['js'] or ['flash]. <br> If some mode is not supported by browser it possible <br> to set stack of modes. When one mode is not supported it <br> will be use next from stack ['js','flash'] or ['flash','js].<br> Custom stack is ['flash','js]. When tag parameter used - for separation <br> of modes space should be used </td>
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
        <td md-cell> 'loaded' </td>
        <td md-cell> On ad is loaded </td>
      </tr>
      <tr md-row >
        <td md-cell> 'error'</td>
        <td md-cell> On ad has some error</td>
      </tr>
       <tr md-row >
        <td md-cell> 'complete' </td>
        <td md-cell> On finish play ad </td>
      </tr>
      <tr md-row >
        <td md-cell> 'started' </td>
        <td md-cell> On ad start play </td>
      </tr>
       <tr md-row >
        <td md-cell> 'resumed' </td>
        <td md-cell> on resumes the current ad </td>
      </tr>
       <tr md-row >
        <td md-cell> 'paused' </td>
        <td md-cell> On ad is paused </td>
      </tr>
      <tr md-row >
        <td md-cell> 'mute' </td>
        <td md-cell> On ad volume muted </td>
      </tr>
      <tr md-row >
        <td md-cell> 'unmute' </td>
        <td md-cell> On ad volume unmuted </td>
      </tr>
    </tbody>
  </table>
</md-table-container>

```javascript
    var outstream = new Outstream({
        aid: 13694,
        width: 400,
        height: 300,
        containerEl: document.getElementById('ad-container')
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

### trigger()
 Trigger Outstream event

### destroy()
 destroy Outstream containerEl content

## Support
 IE from ie7
 Chrome
 FireFox
 Safari
