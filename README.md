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
