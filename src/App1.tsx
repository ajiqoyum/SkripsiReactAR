import * as React from 'react';

import {
  StyleSheet,
  View,
  Platform,
  TouchableHighlight,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ArViewerView } from 'react-native-ar-viewer';
import RNFS from 'react-native-fs';

const IMG_H = 70;
const IMG_W = 75;

export default function App() {
  const [localModelPath, setLocalModelPath] = useState<string>();
  const [showArView, setShowArView] = useState(true);
  const ref = useRef() as React.MutableRefObject<ArViewerView>;

  const MODELS_AND = [
    'https://github.com/ajiqoyum/ProjectGKom/blob/master/android.glb?raw=true'
  ];

  // Load the model path based on the platform
  const loadPath = async (model: string) => {
    const modelSrc =
      Platform.OS === 'android'
        ? `https://github.com/ajiqoyum/ProjectGKom/blob/master/${model}.glb?raw=true`
        : 'https://github.com/riderodd/react-native-ar/blob/main/example/src/dice.usdz?raw=true';

    const modelPath = `${RNFS.DocumentDirectoryPath}/${model}.${Platform.OS === 'android' ? 'glb' : 'usdz'}`;
    const exists = await RNFS.exists(modelPath);

    if (!exists) {
      await RNFS.downloadFile({
        fromUrl: modelSrc,
        toFile: modelPath,
      }).promise;
    }

    setLocalModelPath(modelPath);
  };

  React.useEffect(() => {
    loadPath('android');
  }, []);

  // Set up the AR plane and place the 3D model
  const setUpPress = () => {
    ref.current?.setOnTapArPlaneListener((hitResult: ARHitResult, plane: ARPlane, motionEvent: ARMotionEvent) => {
      const anchor = hitResult.createAnchor();
      const anchorNode = new AnchorNode(anchor);
      anchorNode.setParent(ref.current?.arSceneView.scene);
      createModel(anchorNode);
    });
  };

  const placeModel = (model: string) => {
    loadPath(model).then(() => {
      setUpPress();
    });
  };

  const createModel = (anchorNode: AnchorNode) => {
    anchorNode.attachModel(localModelPath);
  };


  return (
    <View style={styles.container}>
      {localModelPath && showArView && (
        <ArViewerView
          model={localModelPath}
          style={styles.arView}
          disableInstantPlacement={true}
          planeOrientation={'horizontal'}
          manageDepth
          allowRotate
          allowScale
          allowTranslate
          onPress={() => setUpPress()}
          onStarted={() => console.log('started')}
          onEnded={() => console.log('ended')}
          onModelPlaced={() => console.log('model displayed')}
          onModelRemoved={() => console.log('model not visible anymore')}
          ref={ref}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgrey',
    justifyContent:'center'
    // borderWidth:1
  },
  arView: {
    flex: 0.8,
  },
  imageGrid: {
    flex: 0.12,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-evenly'
  },
  imageContainer: {
    backgroundColor:'red',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:10,
    overflow:'hidden'
  },
  footer: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  
  button: {
    borderColor: 'black',
    borderWidth: 1,
    backgroundColor: 'white',
    padding: 10,
    margin: 5,
  },
});