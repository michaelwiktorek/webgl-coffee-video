(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Graphics, g, start_video, stop_video;

Graphics = require("./gl_util.coffee");

g = null;

window.onload = function() {
  var canvas;
  canvas = document.querySelector('#glcanvas');
  g = new Graphics(canvas);
  document.querySelector('#start_video').onclick = start_video;
  return document.querySelector('#stop_video').onclick = stop_video;
};

start_video = function() {
  return g.start_video();
};

stop_video = function() {
  var vid;
  vid = document.querySelector('video');
  vid.src = '';
  return g.stop_video();
};



},{"./gl_util.coffee":2}],2:[function(require,module,exports){
var Graphics,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Graphics = (function() {
  Graphics.anim_id = null;

  Graphics.gl = null;

  Graphics.buffer = null;

  Graphics.program = null;

  Graphics.vid_stream = null;

  Graphics.texture = null;

  Graphics.video = false;

  Graphics.positionLocation = null;

  Graphics.img = null;

  Graphics.vid = null;

  function Graphics(canvas) {
    this.stop_video = bind(this.stop_video, this);
    this.start_video = bind(this.start_video, this);
    this.init_video = bind(this.init_video, this);
    this.render = bind(this.render, this);
    this.init = bind(this.init, this);
    this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.img = new Image();
    this.img.src = "../img/internetsurf.jpg";
  }

  Graphics.prototype.init = function() {
    console.log("init");
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.init_shaders();
    return this.anim_id = window.requestAnimationFrame(this.render);
  };

  Graphics.prototype.render = function() {
    this.anim_id = window.requestAnimationFrame(this.render);
    if (this.video) {
      this.update_texture();
      return this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
  };

  Graphics.prototype.init_shaders = function() {
    var buffer, fragmentShader, positionLocation, resolutionLocation, shaderScript, shaderSource, texCoordBuffer, texCoordLocation, textureSizeLocation, vertexShader;
    shaderScript = document.querySelector("#vert-shader");
    shaderSource = shaderScript.text;
    vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vertexShader, shaderSource);
    this.gl.compileShader(vertexShader);
    shaderScript = document.querySelector("#frag-shader");
    shaderSource = shaderScript.text;
    fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragmentShader, shaderSource);
    this.gl.compileShader(fragmentShader);
    console.log(this.gl.getShaderInfoLog(fragmentShader));
    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    this.gl.useProgram(this.program);
    texCoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");
    positionLocation = this.gl.getAttribLocation(this.program, "a_position");
    texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(texCoordLocation);
    this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
    this.init_textures();
    resolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution");
    this.gl.uniform2f(resolutionLocation, 640, 480);
    buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    textureSizeLocation = this.gl.getUniformLocation(this.program, "u_textureSize");
    this.gl.uniform2f(textureSizeLocation, 640, 480);
    return this.setRectangle(0, 0, 640, 480);
  };

  Graphics.prototype.setRectangle = function(x, y, width, height) {
    var x2, y2;
    x2 = x + width;
    y2 = y + height;
    return this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([x, y, x2, y, x, y2, x, y2, x2, y, x2, y2]), this.gl.STATIC_DRAW);
  };

  Graphics.prototype.init_video = function() {
    if (this.vid) {
      this.vid.src = this.vid_stream;
      return this.anim_id = window.requestAnimationFrame(this.render);
    } else {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      this.vid = document.querySelector('video');
      navigator.getUserMedia({
        video: true,
        audio: false
      }, (function(_this) {
        return function(stream) {
          _this.vid_stream = window.URL.createObjectURL(stream);
          return _this.vid.src = _this.vid_stream;
        };
      })(this), function() {
        return alert("error");
      });
      return this.init();
    }
  };

  Graphics.prototype.init_textures = function() {
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    return this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
  };

  Graphics.prototype.update_texture = function() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    return this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.vid);
  };

  Graphics.prototype.start_video = function() {
    if (!this.video) {
      this.init_video();
      return this.video = true;
    }
  };

  Graphics.prototype.stop_video = function() {
    window.cancelAnimationFrame(this.anim_id);
    this.video = false;
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    return this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  };

  return Graphics;

})();

module.exports = Graphics;



},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWljaGFlbHdpa3RvcmVrL1NpdGVzL3dlYmdsL3NyYy9tYWluLmNvZmZlZSIsIi9Vc2Vycy9taWNoYWVsd2lrdG9yZWsvU2l0ZXMvd2ViZ2wvc3JjL2dsX3V0aWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxvQ0FBQTs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGtCQUFSLENBQVgsQ0FBQTs7QUFBQSxDQUNBLEdBQUksSUFESixDQUFBOztBQUFBLE1BR00sQ0FBQyxNQUFQLEdBQWdCLFNBQUEsR0FBQTtBQUNkLE1BQUEsTUFBQTtBQUFBLEVBQUEsTUFBQSxHQUFTLFFBQVEsQ0FBQyxhQUFULENBQXVCLFdBQXZCLENBQVQsQ0FBQTtBQUFBLEVBQ0EsQ0FBQSxHQUFRLElBQUEsUUFBQSxDQUFTLE1BQVQsQ0FEUixDQUFBO0FBQUEsRUFFQSxRQUFRLENBQUMsYUFBVCxDQUF1QixjQUF2QixDQUFzQyxDQUFDLE9BQXZDLEdBQWlELFdBRmpELENBQUE7U0FHQSxRQUFRLENBQUMsYUFBVCxDQUF1QixhQUF2QixDQUFxQyxDQUFDLE9BQXRDLEdBQWdELFdBSmxDO0FBQUEsQ0FIaEIsQ0FBQTs7QUFBQSxXQVdBLEdBQWMsU0FBQSxHQUFBO1NBQ1osQ0FBQyxDQUFDLFdBQUYsQ0FBQSxFQURZO0FBQUEsQ0FYZCxDQUFBOztBQUFBLFVBY0EsR0FBYSxTQUFBLEdBQUE7QUFDWCxNQUFBLEdBQUE7QUFBQSxFQUFBLEdBQUEsR0FBTSxRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QixDQUFOLENBQUE7QUFBQSxFQUNBLEdBQUcsQ0FBQyxHQUFKLEdBQVEsRUFEUixDQUFBO1NBRUEsQ0FBQyxDQUFDLFVBQUYsQ0FBQSxFQUhXO0FBQUEsQ0FkYixDQUFBOzs7OztBQ0FBLElBQUEsUUFBQTtFQUFBLGdGQUFB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ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiR3JhcGhpY3MgPSByZXF1aXJlIFwiLi9nbF91dGlsLmNvZmZlZVwiXG5nID0gbnVsbFxuXG53aW5kb3cub25sb2FkID0gLT5cbiAgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2dsY2FudmFzJylcbiAgZyA9IG5ldyBHcmFwaGljcyhjYW52YXMpXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzdGFydF92aWRlbycpLm9uY2xpY2sgPSBzdGFydF92aWRlb1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc3RvcF92aWRlbycpLm9uY2xpY2sgPSBzdG9wX3ZpZGVvXG4gIFxuICBcblxuc3RhcnRfdmlkZW8gPSAtPlxuICBnLnN0YXJ0X3ZpZGVvKClcblxuc3RvcF92aWRlbyA9IC0+XG4gIHZpZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3ZpZGVvJylcbiAgdmlkLnNyYz0nJ1xuICBnLnN0b3BfdmlkZW8oKVxuXG5cbiAgICAiLCJjbGFzcyBHcmFwaGljc1xuICBAYW5pbV9pZDogbnVsbFxuICBAZ2w6IG51bGxcbiAgQGJ1ZmZlcjogbnVsbCAjIGZvciBvdXIgZHJhd2luZyBzdXJmYWNlXG4gIEBwcm9ncmFtOiBudWxsXG4gIEB2aWRfc3RyZWFtOiBudWxsXG4gIEB0ZXh0dXJlOiBudWxsXG4gIEB2aWRlbzogZmFsc2VcbiAgQHBvc2l0aW9uTG9jYXRpb246IG51bGxcbiAgQGltZzogbnVsbFxuICBAdmlkOiBudWxsICMgdmlkZW8gb2JqZWN0XG5cbiAgY29uc3RydWN0b3I6IChjYW52YXMpIC0+XG4gICAgQGdsID0gY2FudmFzLmdldENvbnRleHQoXCJ3ZWJnbFwiKSB8fCBjYW52YXMuZ2V0Q29udGV4dChcImV4cGVyaW1lbnRhbC13ZWJnbFwiKVxuICAgIEBnbC52aWV3cG9ydCgwLDAsIEBnbC5kcmF3aW5nQnVmZmVyV2lkdGgsIEBnbC5kcmF3aW5nQnVmZmVySGVpZ2h0KVxuICAgIEBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICBAaW1nLnNyYyA9IFwiLi4vaW1nL2ludGVybmV0c3VyZi5qcGdcIlxuICAgICNAaW1nLm9ubG9hZCA9IEBpbml0XG5cbiAgIyBpbml0aWFsaXplIGdyYXBoaWNzXG4gIGluaXQ6ID0+XG4gICAgY29uc29sZS5sb2coXCJpbml0XCIpXG4gICAgQGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKVxuICAgIEBnbC5jbGVhcihAZ2wuQ09MT1JfQlVGRkVSX0JJVClcblxuICAgIEBpbml0X3NoYWRlcnMoKSAjIGluaXRpYWxpemUgc2hhZGVyc1xuICAgIEBhbmltX2lkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShAcmVuZGVyKSAgICAgICAjIGJlZ2luIHJlbmRlcmluZ1xuXG4gIHJlbmRlcjogPT5cbiAgICBAYW5pbV9pZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoQHJlbmRlcilcbiAgICBpZiBAdmlkZW9cbiAgICAgIEB1cGRhdGVfdGV4dHVyZSgpXG4gICAgICAjIEBnbC50ZXhJbWFnZTJEKEBnbC5URVhUVVJFXzJELCAwLCBAZ2wuUkdCQSwgQGdsLlJHQkEsXG4gICAgICAjIEBnbC5VTlNJR05FRF9CWVRFLCBAaW1nKVxuICAgICAgQGdsLmRyYXdBcnJheXMoQGdsLlRSSUFOR0xFUywgMCwgNilcblxuICAjIGluaXRpYWxpemUgc2hhZGVycyBmcm9tIGh0bWxcbiAgaW5pdF9zaGFkZXJzOiAtPlxuICAgIHNoYWRlclNjcmlwdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmVydC1zaGFkZXJcIilcbiAgICBzaGFkZXJTb3VyY2UgPSBzaGFkZXJTY3JpcHQudGV4dFxuICAgIHZlcnRleFNoYWRlciA9IEBnbC5jcmVhdGVTaGFkZXIoQGdsLlZFUlRFWF9TSEFERVIpXG4gICAgQGdsLnNoYWRlclNvdXJjZSh2ZXJ0ZXhTaGFkZXIsIHNoYWRlclNvdXJjZSlcbiAgICBAZ2wuY29tcGlsZVNoYWRlcih2ZXJ0ZXhTaGFkZXIpXG5cbiAgICBzaGFkZXJTY3JpcHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZyYWctc2hhZGVyXCIpXG4gICAgc2hhZGVyU291cmNlID0gc2hhZGVyU2NyaXB0LnRleHRcbiAgICBmcmFnbWVudFNoYWRlciA9IEBnbC5jcmVhdGVTaGFkZXIoQGdsLkZSQUdNRU5UX1NIQURFUilcbiAgICBAZ2wuc2hhZGVyU291cmNlKGZyYWdtZW50U2hhZGVyLCBzaGFkZXJTb3VyY2UpXG4gICAgQGdsLmNvbXBpbGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpXG4gICAgY29uc29sZS5sb2coQGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpKVxuXG4gICAgQHByb2dyYW0gPSBAZ2wuY3JlYXRlUHJvZ3JhbSgpXG4gICAgQGdsLmF0dGFjaFNoYWRlcihAcHJvZ3JhbSwgdmVydGV4U2hhZGVyKVxuICAgIEBnbC5hdHRhY2hTaGFkZXIoQHByb2dyYW0sIGZyYWdtZW50U2hhZGVyKVxuICAgIEBnbC5saW5rUHJvZ3JhbShAcHJvZ3JhbSlcbiAgICBAZ2wudXNlUHJvZ3JhbShAcHJvZ3JhbSlcblxuICAgIHRleENvb3JkTG9jYXRpb24gPSBAZ2wuZ2V0QXR0cmliTG9jYXRpb24oQHByb2dyYW0sIFwiYV90ZXhDb29yZFwiKVxuICAgIHBvc2l0aW9uTG9jYXRpb24gPSBAZ2wuZ2V0QXR0cmliTG9jYXRpb24oQHByb2dyYW0sIFwiYV9wb3NpdGlvblwiKVxuXG4gICAgdGV4Q29vcmRCdWZmZXIgPSBAZ2wuY3JlYXRlQnVmZmVyKClcbiAgICBAZ2wuYmluZEJ1ZmZlcihAZ2wuQVJSQVlfQlVGRkVSLCB0ZXhDb29yZEJ1ZmZlcilcbiAgICBAZ2wuYnVmZmVyRGF0YShAZ2wuQVJSQVlfQlVGRkVSLCBcbiAgICAgIG5ldyBGbG9hdDMyQXJyYXkoXG4gICAgICAgIFswLjAsICAwLjAsXG4gICAgICAgICAxLjAsICAwLjAsXG4gICAgICAgICAwLjAsICAxLjAsXG4gICAgICAgICAwLjAsICAxLjAsXG4gICAgICAgICAxLjAsICAwLjAsXG4gICAgICAgICAxLjAsICAxLjBdKSwgXG4gICAgICBAZ2wuU1RBVElDX0RSQVcpXG4gICAgQGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRleENvb3JkTG9jYXRpb24pXG4gICAgQGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGV4Q29vcmRMb2NhdGlvbiwgMiwgQGdsLkZMT0FULCBmYWxzZSwgMCwgMClcblxuICAgIEBpbml0X3RleHR1cmVzKClcblxuXG4gICAgcmVzb2x1dGlvbkxvY2F0aW9uID0gQGdsLmdldFVuaWZvcm1Mb2NhdGlvbihAcHJvZ3JhbSwgXCJ1X3Jlc29sdXRpb25cIilcbiAgICBAZ2wudW5pZm9ybTJmKHJlc29sdXRpb25Mb2NhdGlvbiwgNjQwLCA0ODApXG4gICAgYnVmZmVyID0gQGdsLmNyZWF0ZUJ1ZmZlcigpXG4gICAgQGdsLmJpbmRCdWZmZXIoQGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVyKVxuICAgIEBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShwb3NpdGlvbkxvY2F0aW9uKVxuICAgIEBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHBvc2l0aW9uTG9jYXRpb24sIDIsIEBnbC5GTE9BVCwgZmFsc2UsIDAsIDApXG5cbiAgICB0ZXh0dXJlU2l6ZUxvY2F0aW9uID0gQGdsLmdldFVuaWZvcm1Mb2NhdGlvbihAcHJvZ3JhbSwgXCJ1X3RleHR1cmVTaXplXCIpXG4gICAgQGdsLnVuaWZvcm0yZih0ZXh0dXJlU2l6ZUxvY2F0aW9uLCA2NDAsIDQ4MClcblxuICAgIEBzZXRSZWN0YW5nbGUoMCwgMCwgNjQwLCA0ODApXG4gICAgIyBAcG9zaXRpb25Mb2NhdGlvbiA9IEBnbC5nZXRBdHRyaWJMb2NhdGlvbihAcHJvZ3JhbSwgXCJhX3Bvc2l0aW9uXCIpXG4gICAgIyBAZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoQHBvc2l0aW9uTG9jYXRpb24pXG4gICAgIyBAZ2wudmVydGV4QXR0cmliUG9pbnRlcihAcG9zaXRpb25Mb2NhdGlvbiwgMiwgQGdsLkZMT0FULCBmYWxzZSwgMCwgMClcblxuICBzZXRSZWN0YW5nbGU6ICh4LCB5LCB3aWR0aCwgaGVpZ2h0KS0+XG4gICAgeDIgPSB4ICsgd2lkdGhcbiAgICB5MiA9IHkgKyBoZWlnaHRcbiAgICBAZ2wuYnVmZmVyRGF0YShAZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KFxuICAgICAgW3gsIHksXG4gICAgICAgeDIsIHksXG4gICAgICAgeCwgeTIsXG4gICAgICAgeCwgeTIsXG4gICAgICAgeDIsIHksXG4gICAgICAgeDIsIHkyXVxuICAgICAgKSwgQGdsLlNUQVRJQ19EUkFXKVxuXG4gIGluaXRfdmlkZW86ID0+XG4gICAgaWYgQHZpZFxuICAgICAgQHZpZC5zcmMgPSBAdmlkX3N0cmVhbVxuICAgICAgQGFuaW1faWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKEByZW5kZXIpXG4gICAgZWxzZVxuICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgb3IgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSBvciBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhXG4gICAgICBAdmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigndmlkZW8nKVxuICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSh7dmlkZW86IHRydWUsIGF1ZGlvOiBmYWxzZX0sIFxuICAgICAgICAoc3RyZWFtKT0+XG4gICAgICAgICAgQHZpZF9zdHJlYW0gPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pXG4gICAgICAgICAgQHZpZC5zcmMgPSBAdmlkX3N0cmVhbVxuICAgICAgICAsIC0+XG4gICAgICAgICAgYWxlcnQgXCJlcnJvclwiKVxuICAgICAgQGluaXQoKVxuXG4gIGluaXRfdGV4dHVyZXM6IC0+XG4gICAgQHRleHR1cmUgPSBAZ2wuY3JlYXRlVGV4dHVyZSgpXG4gICAgQGdsLmJpbmRUZXh0dXJlKEBnbC5URVhUVVJFXzJELCBAdGV4dHVyZSlcbiAgICBAZ2wudGV4UGFyYW1ldGVyaShAZ2wuVEVYVFVSRV8yRCwgQGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQGdsLkxJTkVBUilcbiAgICBAZ2wudGV4UGFyYW1ldGVyaShAZ2wuVEVYVFVSRV8yRCwgQGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQGdsLkxJTkVBUilcbiAgICBAZ2wudGV4UGFyYW1ldGVyaShAZ2wuVEVYVFVSRV8yRCwgQGdsLlRFWFRVUkVfV1JBUF9TLCBAZ2wuQ0xBTVBfVE9fRURHRSkgXG4gICAgQGdsLnRleFBhcmFtZXRlcmkoQGdsLlRFWFRVUkVfMkQsIEBnbC5URVhUVVJFX1dSQVBfVCwgQGdsLkNMQU1QX1RPX0VER0UpIFxuXG4gIHVwZGF0ZV90ZXh0dXJlOiAtPlxuICAgIEBnbC5iaW5kVGV4dHVyZShAZ2wuVEVYVFVSRV8yRCwgQHRleHR1cmUpXG4gICAgI0BnbC5waXhlbFN0b3JlaShAZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdHJ1ZSlcbiAgICBAZ2wudGV4SW1hZ2UyRChAZ2wuVEVYVFVSRV8yRCwgMCwgQGdsLlJHQkEsIEBnbC5SR0JBLFxuICAgICAgQGdsLlVOU0lHTkVEX0JZVEUsIEB2aWQpXG5cbiAgc3RhcnRfdmlkZW86ID0+XG4gICAgaWYgbm90IEB2aWRlb1xuICAgICAgQGluaXRfdmlkZW8oKVxuICAgICAgQHZpZGVvID0gdHJ1ZVxuICBzdG9wX3ZpZGVvOiA9PlxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShAYW5pbV9pZClcbiAgICBAdmlkZW8gPSBmYWxzZVxuICAgIEBnbC5jbGVhckNvbG9yKDEuMCwgMS4wLCAxLjAsIDEuMClcbiAgICBAZ2wuY2xlYXIoQGdsLkNPTE9SX0JVRkZFUl9CSVQpXG5cblxuXG4gICAgXG5cblxubW9kdWxlLmV4cG9ydHMgPSBHcmFwaGljcyJdfQ==
