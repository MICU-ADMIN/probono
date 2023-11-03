import React, { useState, useEffect } from 'react'
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
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { useLink } from 'solito/link'
import { Form, H4, Spinner } from 'tamagui'
import { Toast, useToastState } from '@tamagui/toast'
import { Label, Switch } from 'tamagui'

import { Text, View, StyleSheet } from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner'

function Barcode({ setData }) {
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)
    setData(data)
    alert(`Bar code with type ${type} and data ${data} has been scanned!`)
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  )
}

export function HomeScreen() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState()

  const linkProps = useLink({
    href: '/user/nate',
  })

  useEffect(() => {
    data && setOpen(true)

    return () => {
      setData(null)
    }
  }, [data])

  return (
    <YStack f={1} jc="center" ai="center" p="$4" space>
      <Barcode setData={setData} />
      {/* <XStack>
        <Button {...linkProps}>Link to user</Button>
      </XStack> */}
      <SheetDemo data={data} open={open} setOpen={setOpen} />
    </YStack>
  )
}

function SheetDemo({ open, data, setOpen }) {
  const [position, setPosition] = useState(0)
  const toast = useToastController()

  return (
    <>
      <Button
        size="$6"
        icon={open ? ChevronDown : ChevronUp}
        circular
        onPress={() => setOpen((x) => !x)}
      />
      <Sheet
        modal
        animation="medium"
        open={open}
        onOpenChange={setOpen}
        snapPoints={[30]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Frame ai="center" jc="center">
          <Sheet.Handle />
          <FormValidator data={data} open={open} setOpen={setOpen} size={'$5'} />
        </Sheet.Frame>
      </Sheet>
    </>
  )
}

function FormValidator({ size, open, setOpen, data }) {
  const [status, setStatus] = useState<'off' | 'submitting' | 'submitted'>('off')
  const [response, setResponse] = useState(null)

  const toast = useToastController()

  useEffect(() => {
    data && setStatus('submitting')
    return () => {
      setStatus('off')
    }
  }, [data])

  useEffect(() => {
    if (status === 'submitting') {
      checkValidity(data).then((result) => {
        setResponse(result)
        setTimeout(() => {
          setStatus('off')
          setOpen(false)
          toast.show(`${result}`, {
            message:
              result === 'Invalid'
                ? 'Nothing found, perhaps try again.'
                : 'Sucessful read please continue',
          })
        }, 2000)
      })
    }
  }, [status, data])

  return (
    <Form
      alignItems="center"
      minWidth={300}
      gap="$2"
      onSubmit={() => setStatus('submitting')}
      // borderWidth={1}
      borderRadius="$4"
      backgroundColor="$background"
      // borderColor="$borderColor"
      // padding="$8"
    >
      <H4>{status[0].toUpperCase() + status.slice(1)}</H4>

      <Form.Trigger asChild disabled={status !== 'off'}>
        <Button icon={status === 'submitting' ? () => <Spinner /> : undefined}>Checking</Button>
      </Form.Trigger>
    </Form>
  )
}

// UTIL

const checkValidity = async (data) => {
  return new Promise((resolve) => {
    setTimeout(function () {
      const result = Math.random() < 0.5
      resolve(result ? 'Valid' : 'Invalid')
    }, 2000)
  })
}
