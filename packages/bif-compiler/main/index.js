const { DockerImageChannel } = require('@obsidians/docker')
const { exec } = require("child_process");

class CompilerManager {
  constructor () {
    // this.xdev = new DockerImageChannel('xuper/xdev')
    this.bif = new DockerImageChannel('caictdevelop/bif-solidity')
    this.cdt = new DockerImageChannel('caictdevelop/bifchain-wasm-cdt')
    this.abi = new DockerImageChannel('caictdevelop/bifchain-wasm-abi')
  }
}

module.exports = CompilerManager