import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { Button, Square } from 'tamagui'

import { useRef, useState } from 'react'

import { Button, Square, YStack } from 'tamagui'
import { useIsIntersecting } from './useOnIntersecting'

import {
  Anchor,
  Button,
  H1,
  Paragraph,
  Separator,
  Sheet,
  Spinner,
  useToastController,
  XStack,
  YStack,
} from '@my/ui'
import { Shield, ShieldCheck, ShieldClose } from '@tamagui/lucide-icons'

export function HomeScreen() {
  // State variables to manage the application's behavior
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [data, setData] = useState(null)
  const [position, setPosition] = useState(0)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState()
  const [key, setKey] = useState(0)
  const [positionI, setPositionI] = React.useState(0)
  const [result, setResult] = useState(null)

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
    //  open bottom sheet
    setData(data)
    // save data
    setPositionI((i) => (i + 1) % positions.length)
    // move choice emoji around
    const res = await checkValidity(data)
    //  get back choice if user is legit or not
    setPositionI((i) => (i + 1) % positions.length)
    // move square again
    setResult(res)
    // send the choice to the child components for conditional rendering of X or √
    setKey(Math.random())
    // mount the choice icon

    setHistory([...history, data])
    //  add to history the scan
    setData(null)
    // clear the data
    setTimeout(function () {
      setScanned(false)
    }, 500)
    // close the bottom sheet
    toast.show(`${result}`, {
      message:
        result === 'Invalid'
          ? 'Nothing found, perhaps try again.'
          : 'Successful read, please continue',
    })
    //  let the user know the condition for a bit longer
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
          <MountingAnimation key={key} setKey={setKey}>
            <LoadingAnimation result={result} positionI={positionI} setPositionI={setPositionI} />
          </MountingAnimation>
        </Sheet.Frame>
      </Sheet>
    </View>
  )
}

function MountingAnimation(props) {
  const { key, setKey } = props
  const ref = useRef(null)
  const hasIntersected = useIsIntersecting(ref, { once: true })

  if (!hasIntersected) {
    return <YStack ref={ref} />
  }
  return (
    <>
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
    </>
  )
}

function LoadingAnimation(props) {
  const { positionI, setPositionI } = props

  return (
    <>
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
        {...positions[positionI]}
      >
        {result === 'Invalid' && (
          <YStack ai="center">
            <ShieldCheck size="$4" />
            <MountingAnimation key={Math.random()}>
              <H5>Invalid</H5>
            </MountingAnimation>
          </YStack>
        )}
        {result === 'Valid' && (
          <YStack ai="center">
            <ShieldClose size="$4" />
            <MountingAnimation key={Math.random()}>
              <H5>Invalid</H5>
            </MountingAnimation>
          </YStack>
        )}
        {!result && <Shield size="$4" />}
      </Square>
    </>
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
    rotate: '180deg',
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

// Styles for the container
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
})
