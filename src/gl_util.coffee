class Graphics
  @anim_id: null
  @gl: null
  @buffer: null # for our drawing surface
  @program: null
  @vid_stream: null
  @texture: null
  @video: false
  @positionLocation: null
  @img: null
  @vid: null # video object

  constructor: (canvas) ->
    @gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    @gl.viewport(0,0, @gl.drawingBufferWidth, @gl.drawingBufferHeight)
    @img = new Image();
    @img.src = "../img/internetsurf.jpg"
    #@img.onload = @init

  # initialize graphics
  init: =>
    console.log("init")
    @gl.clearColor(0.0, 0.0, 0.0, 1.0)
    @gl.clear(@gl.COLOR_BUFFER_BIT)

    @init_shaders() # initialize shaders
    @anim_id = window.requestAnimationFrame(@render)       # begin rendering

  render: =>
    @anim_id = window.requestAnimationFrame(@render)
    if @video
      @update_texture()
      # @gl.texImage2D(@gl.TEXTURE_2D, 0, @gl.RGBA, @gl.RGBA,
      # @gl.UNSIGNED_BYTE, @img)
      @gl.drawArrays(@gl.TRIANGLES, 0, 6)

  # initialize shaders from html
  init_shaders: ->
    shaderScript = document.querySelector("#vert-shader")
    shaderSource = shaderScript.text
    vertexShader = @gl.createShader(@gl.VERTEX_SHADER)
    @gl.shaderSource(vertexShader, shaderSource)
    @gl.compileShader(vertexShader)

    shaderScript = document.querySelector("#frag-shader")
    shaderSource = shaderScript.text
    fragmentShader = @gl.createShader(@gl.FRAGMENT_SHADER)
    @gl.shaderSource(fragmentShader, shaderSource)
    @gl.compileShader(fragmentShader)
    console.log(@gl.getShaderInfoLog(fragmentShader))

    @program = @gl.createProgram()
    @gl.attachShader(@program, vertexShader)
    @gl.attachShader(@program, fragmentShader)
    @gl.linkProgram(@program)
    @gl.useProgram(@program)

    texCoordLocation = @gl.getAttribLocation(@program, "a_texCoord")
    positionLocation = @gl.getAttribLocation(@program, "a_position")

    texCoordBuffer = @gl.createBuffer()
    @gl.bindBuffer(@gl.ARRAY_BUFFER, texCoordBuffer)
    @gl.bufferData(@gl.ARRAY_BUFFER, 
      new Float32Array(
        [0.0,  0.0,
         1.0,  0.0,
         0.0,  1.0,
         0.0,  1.0,
         1.0,  0.0,
         1.0,  1.0]), 
      @gl.STATIC_DRAW)
    @gl.enableVertexAttribArray(texCoordLocation)
    @gl.vertexAttribPointer(texCoordLocation, 2, @gl.FLOAT, false, 0, 0)

    @init_textures()


    resolutionLocation = @gl.getUniformLocation(@program, "u_resolution")
    @gl.uniform2f(resolutionLocation, 640, 480)
    buffer = @gl.createBuffer()
    @gl.bindBuffer(@gl.ARRAY_BUFFER, buffer)
    @gl.enableVertexAttribArray(positionLocation)
    @gl.vertexAttribPointer(positionLocation, 2, @gl.FLOAT, false, 0, 0)

    textureSizeLocation = @gl.getUniformLocation(@program, "u_textureSize")
    @gl.uniform2f(textureSizeLocation, 640, 480)

    @setRectangle(0, 0, 640, 480)
    # @positionLocation = @gl.getAttribLocation(@program, "a_position")
    # @gl.enableVertexAttribArray(@positionLocation)
    # @gl.vertexAttribPointer(@positionLocation, 2, @gl.FLOAT, false, 0, 0)

  setRectangle: (x, y, width, height)->
    x2 = x + width
    y2 = y + height
    @gl.bufferData(@gl.ARRAY_BUFFER, new Float32Array(
      [x, y,
       x2, y,
       x, y2,
       x, y2,
       x2, y,
       x2, y2]
      ), @gl.STATIC_DRAW)

  init_video: =>
    if @vid
      @vid.src = @vid_stream
      @anim_id = window.requestAnimationFrame(@render)
    else
      navigator.getUserMedia = navigator.getUserMedia or navigator.webkitGetUserMedia or navigator.mozGetUserMedia
      @vid = document.querySelector('video')
      navigator.getUserMedia({video: true, audio: false}, 
        (stream)=>
          @vid_stream = window.URL.createObjectURL(stream)
          @vid.src = @vid_stream
        , ->
          alert "error")
      @init()

  init_textures: ->
    @texture = @gl.createTexture()
    @gl.bindTexture(@gl.TEXTURE_2D, @texture)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MAG_FILTER, @gl.LINEAR)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MIN_FILTER, @gl.LINEAR)
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_WRAP_S, @gl.CLAMP_TO_EDGE) 
    @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_WRAP_T, @gl.CLAMP_TO_EDGE) 

  update_texture: ->
    @gl.bindTexture(@gl.TEXTURE_2D, @texture)
    #@gl.pixelStorei(@gl.UNPACK_FLIP_Y_WEBGL, true)
    @gl.texImage2D(@gl.TEXTURE_2D, 0, @gl.RGBA, @gl.RGBA,
      @gl.UNSIGNED_BYTE, @vid)

  start_video: =>
    if not @video
      @init_video()
      @video = true
  stop_video: =>
    window.cancelAnimationFrame(@anim_id)
    @video = false
    @gl.clearColor(1.0, 1.0, 1.0, 1.0)
    @gl.clear(@gl.COLOR_BUFFER_BIT)



    


module.exports = Graphics