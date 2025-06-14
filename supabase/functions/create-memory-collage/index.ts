
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { imageUrls, memoryId, title } = await req.json()

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Se só tem uma imagem, retorna ela mesma
    if (imageUrls.length === 1) {
      return new Response(
        JSON.stringify({ collageUrl: imageUrls[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Para múltiplas imagens, cria uma colagem simples
    const collageUrl = await createSimpleCollage(imageUrls, memoryId, title, supabase)

    return new Response(
      JSON.stringify({ collageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating collage:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create collage', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function createSimpleCollage(imageUrls: string[], memoryId: string, title: string, supabase: any) {
  try {
    // Baixar todas as imagens
    const imagePromises = imageUrls.map(async (url) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch image: ${url}`)
      return await response.arrayBuffer()
    })

    const imageBuffers = await Promise.all(imagePromises)
    
    // Criar uma colagem simples usando Canvas API
    const canvas = new OffscreenCanvas(800, 600)
    const ctx = canvas.getContext('2d')
    
    if (!ctx) throw new Error('Could not get canvas context')

    // Fundo branco
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 800, 600)

    // Calcular layout baseado no número de imagens
    const numImages = imageBuffers.length
    let cols, rows
    
    if (numImages <= 2) {
      cols = numImages
      rows = 1
    } else if (numImages <= 4) {
      cols = 2
      rows = 2
    } else if (numImages <= 6) {
      cols = 3
      rows = 2
    } else {
      cols = 3
      rows = 3
    }

    const imageWidth = Math.floor(780 / cols)
    const imageHeight = Math.floor(550 / rows)
    const padding = 10

    // Desenhar cada imagem na posição calculada
    for (let i = 0; i < Math.min(numImages, 9); i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      
      const x = padding + col * imageWidth
      const y = padding + row * imageHeight

      try {
        // Criar blob da imagem
        const blob = new Blob([imageBuffers[i]])
        const imageBitmap = await createImageBitmap(blob)
        
        // Desenhar imagem mantendo proporção
        const scale = Math.min(
          (imageWidth - padding) / imageBitmap.width,
          (imageHeight - padding) / imageBitmap.height
        )
        
        const scaledWidth = imageBitmap.width * scale
        const scaledHeight = imageBitmap.height * scale
        
        const centerX = x + (imageWidth - scaledWidth) / 2
        const centerY = y + (imageHeight - scaledHeight) / 2

        ctx.drawImage(imageBitmap, centerX, centerY, scaledWidth, scaledHeight)
      } catch (error) {
        console.error(`Error processing image ${i}:`, error)
      }
    }

    // Adicionar título se fornecido
    if (title) {
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(title, 400, 580)
    }

    // Converter canvas para blob
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 })
    
    // Upload para Supabase Storage
    const fileName = `collage-${memoryId}-${Date.now()}.jpg`
    const filePath = `${memoryId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('memory-images')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload collage: ${uploadError.message}`)
    }

    // Obter URL pública
    const { data } = supabase.storage
      .from('memory-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Error in createSimpleCollage:', error)
    throw error
  }
}
