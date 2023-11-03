import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner'
import {
  Anchor,
  Button,
  H1,
  Paragraph,
  Separator,
  Sheet,
  useToastController,
  XStack,
  YStack,
} from '@my/ui'

export default function App() {
  // State variables to manage the application's behavior
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [data, setData] = useState(null)
  const [position, setPosition] = useState(0)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = (useState < 'off') | 'submitting ' | ('submitted' > 'off')

  // Toast controller for displaying messages
  const toast = useToastController()

  // useEffect to request camera permissions when the component mounts
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    }

    getBarCodeScannerPermissions()
  }, [])

  // Function to handle barcode scans
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true)
    setData(data)
    setLoading('submitting')
    const result = await checkValidity(data)
    result && setLoading('submitted')
    setHistory([...history, data])
    setData(null)
    toast.show(`${result}`, {
      message:
        result === 'Invalid'
          ? 'Nothing found, perhaps try again.'
          : 'Successful read, please continue',
    })
  }

  // Conditional rendering based on camera permissions
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View style={styles.container}>
      {/* Barcode scanner component */}
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Sheet modal for displaying scan result and loading state */}
      <Sheet
        modal
        animation="medium"
        open={scanned}
        onOpenChange={setScanned}
        snapPoints={[30]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Frame ai="center" jc="center">
          <Sheet.Handle />
          <Button icon={loading === 'submitting' ? () => <Spinner /> : undefined}>{loading}</Button>
        </Sheet.Frame>
      </Sheet>
    </View>
  )
}

// Function to simulate validity check with a delay
const checkValidity = async (data) => {
  return new Promise((resolve) => {
    setTimeout(function () {
      const result = Math.random() < 0.5
      resolve(result ? 'Valid' : 'Invalid')
    }, 2000)
  })
}

// Styles for the container
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
})
