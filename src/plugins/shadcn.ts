import type { App } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Textarea } from '@/components/ui/textarea'

export function registerShadcnComponents(app: App) {
  // Register Card components
  app.component('Card', Card)
  app.component('CardHeader', CardHeader)
  app.component('CardContent', CardContent)
  app.component('CardTitle', CardTitle)

  // Register Form components
  app.component('Button', Button)
  app.component('Input', Input)
  app.component('Textarea', Textarea)

  // Register Select components
  app.component('Select', Select)
  app.component('SelectContent', SelectContent)
  app.component('SelectItem', SelectItem)
  app.component('SelectTrigger', SelectTrigger)
  app.component('SelectValue', SelectValue)

  // Register Radio components
  app.component('RadioGroup', RadioGroup)
  app.component('RadioGroupItem', RadioGroupItem)

  // Register Dialog components
  app.component('Dialog', Dialog)
  app.component('DialogContent', DialogContent)
  app.component('DialogHeader', DialogHeader)
  app.component('DialogTitle', DialogTitle)
  app.component('DialogDescription', DialogDescription)
}
