import { Stack } from 'expo-router'
import React, { useReducer } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { Square, H5, Sheet, useToastController, YStack } from '@my/ui'
import { Shield, ShieldCheck, ShieldClose } from '@tamagui/lucide-icons'

// Define the initial state for the useReducer hook
const initialState = {
  hasPermission: false, // Permission status for using the barcode scanner
  scanned: false, // Flag to indicate if a barcode has been scanned
  data: null, // Data from the scanned barcode
  position: 0, // Current position
  history: [], // Array to store the scan history
  loading: false, // Loading indicator
  key: 0, // A key value
  positionI: 0, // Another position indicator
  result: null, // Result data
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_HAS_PERMISSION':
      // Update the hasPermission property in the state with the provided payload
      return { ...state, hasPermission: action.payload }

    case 'SET_SCANNED':
      // Update the scanned property in the state with the provided payload
      return { ...state, scanned: action.payload }

    case 'SET_DATA':
      // Update the data property in the state with the provided payload
      return { ...state, data: action.payload }

    case 'SET_POSITION':
      // Update the position property in the state with the provided payload
      return { ...state, position: action.payload }

    case 'SET_HISTORY':
      // Append the payload to the history array in the state
      return { ...state, history: [...state.history, action.payload] }

    case 'SET_LOADING':
      // Update the loading property in the state with the provided payload
      return { ...state, loading: action.payload }

    case 'SET_KEY':
      // Generate a new random key value and update it in the state
      return { ...state, key: Math.random() }

    case 'SET_POSITION_I':
      // Update the positionI property based on the current value and an external array
      return { ...state, positionI: (state.positionI + 1) % positions.length }

    case 'SET_RESULT':
      // Update the result property in the state with the provided payload
      return { ...state, result: action.payload }

    default:
      // If the action type is not recognized, throw an error
      throw new Error('Unhandled action type')
  }
}

export function HomeScreen() {
  // Initialize state and dispatch using the useReducer hook
  const [state, dispatch] = useReducer(reducer, initialState)
  const toast = useToastController()

  // Function to handle barcode scanning
  const handleBarCodeScanned = async ({ type, data }) => {
    // Update the state based on the scanned barcode
    dispatch({ type: 'SET_SCANNED', payload: true })
    dispatch({ type: 'SET_DATA', payload: data })
    dispatch({ type: 'SET_POSITION_I' })

    // Call an async function to check the validity of the scanned data
    const res = await checkValidity(data)
    dispatch({ type: 'SET_POSITION_I' })
    dispatch({ type: 'SET_RESULT', payload: res })
    dispatch({ type: 'SET_KEY' })
    dispatch({ type: 'SET_HISTORY', payload: data })
    dispatch({ type: 'SET_DATA', payload: null })

    // Set a timeout to reset the scanned state after 500 milliseconds
    setTimeout(function () {
      dispatch({ type: 'SET_SCANNED', payload: false })
    }, 500)

    // Show a toast message based on the scanning result
    toast &&
      toast.show(`${res}`, {
        message:
          res === 'Invalid'
            ? 'Nothing found, perhaps try again.'
            : 'Successful read, please continue',
      })
  }

  // Check the camera permission status and render accordingly
  if (state.hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (state.hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  // Render the component
  //  Sheet modal for displaying scan result and loading state
  // Barcode scanner component

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={state.scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <Sheet
        modal
        animation="medium"
        // if scanned is true open modal
        // open={state.scanned}
        open={state.scanned}
        // when modal is closed take the false value and apply it to the scanned
        onOpenChange={(value) => dispatch({ type: 'SET_SCANNED', payload: value })}
        // only come up 30% of the screen
        snapPoints={[40]}
        position={state.position}
        onPositionChange={(value) => dispatch({ type: 'SET_POSITION', payload: value })}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Frame ai="center" jc="center">
          <Sheet.Handle />
          <MountingAnimation key={state.key}>
            <LoadingAnimation result={state.result} positionI={state.positionI} />
          </MountingAnimation>
        </Sheet.Frame>
      </Sheet>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
})

function MountingAnimation(props) {
  const { key } = props

  return (
    <Square
      key={key}
      enterStyle={{
        scale: 1.5,
        y: -10,
        opacity: 0,
      }}
      animation="bouncy"
      elevation="$4"
      size={110}
      opacity={1}
      scale={1}
      y={0}
      backgroundColor="$pink10"
      borderRadius="$9"
    >
      {props.children}
    </Square>
  )
}

function LoadingAnimation(props) {
  return (
    <Square
      animation="bouncy"
      size={110}
      bc="$pink10"
      br="$9"
      hoverStyle={{
        scale: 1.1,
      }}
      pressStyle={{
        scale: 0.9,
      }}
      {...positions[props.positionI]}
    >
      {props.result === 'Invalid' && (
        <YStack ai="center">
          <ShieldCheck size="$4" />
          <MountingAnimation key={Math.random()}>
            <H5>Invalid</H5>
          </MountingAnimation>
        </YStack>
      )}
      {props.result === 'Valid' && (
        <YStack ai="center">
          <ShieldClose size="$4" />
          <MountingAnimation key={Math.random()}>
            <H5>Invalid</H5>
          </MountingAnimation>
        </YStack>
      )}
      {!props.result && <Shield size="$4" />}
    </Square>
  )
}

export const positions = [
  {
    x: 0,
    y: 0,
    scale: 1,
    rotate: '0deg',
  },
  {
    x: -50,
    y: -50,
    scale: 0.5,
    rotate: '-45deg',
    hoverStyle: {
      scale: 0.6,
    },
    pressStyle: {
      scale: 0.4,
    },
  },
  {
    x: 50,
    y: 50,
    scale: 1,
    rotate: '360deg',
    hoverStyle: {
      scale: 1.1,
    },
    pressStyle: {
      scale: 0.9,
    },
  },
]

// Function to simulate validity check with a delay
const checkValidity = async (data) => {
  return new Promise((resolve) => {
    setTimeout(function () {
      const result = Math.random() < 0.5
      resolve(result ? 'Valid' : 'Invalid')
    }, 2000)
  })
}

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
        }}
      />
      <HomeScreen />
    </>
  )
}
