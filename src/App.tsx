import React, { useEffect, useRef } from 'react';
import './App.css';
import Autodesk from 'autodesk-forge-viewer';

const autodesk: typeof Autodesk = (window as any).Autodesk;

const App: React.FC = () => {
  let viewerApp = useRef<Autodesk.Viewing.ViewingApplication>();
  const documentId = 'urn:YOUR_URN';

  const options: Autodesk.Viewing.InitializerOptions = {
    env: 'AutodeskProduction',
    getAccessToken: function (onGetAccessToken) {
      const accessToken = 'YOUR_APP_TOKeN';
      const expireTimeSeconds = 60 * 30;
      if (onGetAccessToken) {
        onGetAccessToken(accessToken, expireTimeSeconds);
      }
    }
  };

  function onDocumentLoadSuccess(doc: Autodesk.Viewing.Document) {
    // We could still make use of Document.getSubItemsWithProperties()
    // However, when using a ViewingApplication, we have access to the **bubble** attribute,
    // which references the root node of a graph that wraps each object from the Manifest JSON.
    const app = viewerApp.current;
    if(!app) return;
    const viewables = app.bubble.search({ 'type': 'geometry' });
    if (viewables.length === 0) {
      console.error('Document contains no viewables.');
      return;
    }
    // Choose any of the avialble viewables
    app.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
  }
 
  useEffect(() => {
    autodesk.Viewing.Initializer(options, () => {
      const app = new autodesk.Viewing.ViewingApplication('viewer');
      viewerApp.current = app;
      app.registerViewer(app.k3D, autodesk.Viewing.Private.GuiViewer3D);
      app.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
    return () => {
      if (viewerApp.current) {
        viewerApp.current.finish();
        viewerApp.current = undefined;
      } 
    };
  }, [options]);

  return (
    <div>
      <div id="viewer" />
    </div>
  );
}

export default App;

function onItemLoadFail(errorCode: number) {
  console.error('onItemLoadFail() - errorCode:' + errorCode);
}

function onDocumentLoadFailure(viewerErrorCode: number) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onItemLoadSuccess(viewer: Autodesk.Viewing.Viewer3D, item: Autodesk.Viewing.ViewerItem) {
  console.log('onItemLoadSuccess()!', viewer, item);
}
