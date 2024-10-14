// In your sketch.js

let apiKey = 'hSHL2vyjEo_eolZB1qWpCICLLkVCTGdoYEI46u_S-GI'; // Your actual Unsplash API Access Key
let editor;

function setup() {
  noCanvas(); // No need for a canvas in this setup

  // Create a contenteditable div for the text editor
  editor = createDiv();
  editor.id('editor');
  editor.attribute('contenteditable', 'true');
  editor.attribute('spellcheck', 'false');

  // Set focus to the editor on load
  editor.elt.focus();

  // Add a keydown listener to detect when the spacebar is pressed
  editor.elt.addEventListener('keydown', function(event) {
    if (event.code === 'Space' || event.keyCode === 32) {
      // Prevent default space character insertion
      event.preventDefault();

      // Get the caret position and the last word before the caret
      let selection = window.getSelection();
      let range = selection.getRangeAt(0);
      let caretPosition = range.startOffset;

      // Get the text node and its content
      let textNode = range.startContainer;
      if (textNode.nodeType !== Node.TEXT_NODE) {
        // If the caret is not in a text node, create a new text node
        textNode = document.createTextNode('');
        range.insertNode(textNode);
        range.setStart(textNode, 0);
        range.setEnd(textNode, 0);
        caretPosition = 0;
      }

      let textContent = textNode.textContent;
      let beforeCaretText = textContent.substring(0, caretPosition);

      // Find the start index of the last word
      let lastWordMatch = beforeCaretText.match(/(\S+)$/);
      if (lastWordMatch) {
        let lastWord = lastWordMatch[0];
        let lastWordStartIndex = caretPosition - lastWord.length;

        // Create a range to select the last word
        let wordRange = document.createRange();
        wordRange.setStart(textNode, lastWordStartIndex);
        wordRange.setEnd(textNode, caretPosition);

        // Delete the last word
        wordRange.deleteContents();

        // Fetch the image for the last word
        fetchImageForWord(lastWord, range);
      } else {
        // Insert a space if there's no last word
        insertTextAtRange(' ', range);
      }
    }
  });
}

function fetchImageForWord(word, range) {
  let url = `https://api.unsplash.com/search/photos?query=${word}&client_id=${apiKey}&per_page=1`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.results.length > 0) {
        let imageUrl = data.results[0].urls.small;
        insertImageAtRange(imageUrl, range);
      } else {
        // If no image is found, insert a space instead
        insertTextAtRange(' ', range);
      }
    })
    .catch(error => {
      console.error('Error fetching image:', error);
      // On error, insert a space
      insertTextAtRange(' ', range);
    });
}

function insertImageAtRange(imageUrl, range) {
  // Create an image element
  let img = document.createElement('img');
  img.src = imageUrl;
  img.style.maxWidth = '4vw'; // Set image size
  img.setAttribute('contenteditable', 'false'); // Make the image non-editable

  // Insert the image at the caret position
  range.insertNode(img);

  // Insert a space after the image for proper formatting
  let spaceNode = document.createTextNode(' ');
  range.setStartAfter(img);
  range.insertNode(spaceNode);

  // Move the caret after the space
  range.setStartAfter(spaceNode);
  range.collapse(true);

  // Update the selection
  let selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  // Set focus back to the editor
  editor.elt.focus();
}

function insertTextAtRange(text, range) {
  let textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);

  // Update the selection
  let selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  // Set focus back to the editor
  editor.elt.focus();
}
