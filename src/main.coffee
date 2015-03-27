Graphics = require "./gl_util.coffee"
g = null

window.onload = ->
  canvas = document.querySelector('#glcanvas')
  g = new Graphics(canvas)
  document.querySelector('#start_video').onclick = start_video
  document.querySelector('#stop_video').onclick = stop_video
  document.querySelector('#kernels').onchange = set_kernel

start_video = ->
  g.start_video()

stop_video = ->
  vid = document.querySelector('video')
  vid.src=''
  g.stop_video()

set_kernel = ->
  list = document.querySelector('#kernels')
  g.setKernel(list.value)


    