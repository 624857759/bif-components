import { DockerImageChannel } from '@obsidians/docker'
import fileOps from '@obsidians/file-ops'
import { CompilerManager } from '@obsidians/eth-compiler'
import notification from '@obsidians/notification'
import platform from '@obsidians/platform'
export class PlatonCompilerManager extends CompilerManager {
  constructor (props) {
    super()
    this.bif = new DockerImageChannel('caictdevelop/bif-solidity')
    this.cdt = new DockerImageChannel('caictdevelop/bifchain-wasm-cdt')
    this.abi = new DockerImageChannel('caictdevelop/bifchain-wasm-abi')
    this._button = null

    if (platform.isDesktop) {
      this.solImage = 'caictdevelop/bif-solidity:v0.4.26'
    } else {
      this.solImage = 'harbor.teleinfo.cn/xinghuo/solidity:1.0.0'
    }
  }

  set button(v) {
    this._button = v
  }

  async build(settings, projectManager, sourceFile) {
    console.log(settings, projectManager, sourceFile, 88)
    if (projectManager.remote) {
      return await this.buildRemote(settings, projectManager, sourceFile)
    }
    await this.buildLocal(settings, projectManager, sourceFile)
  }

  async buildLocal(settings, projectManager, sourceFile) {
    const projectRoot = this.projectRoot
    const { language, compilers, main } = settings

    let cmd
    if (language === 'cpp') {
      cmd = await this.generateBuildCmdForCpp({ projectRoot, compilers, main })
    } else if (language === 'solidity') {
      cmd = await this.generateBuildCmdForSolidity({ projectRoot, compilers, main })
    } else {
      notification.error('编译失败', '当前语言不支持')
      throw new Error('Unsupported language')
    }

    CompilerManager.button.setState({ building: true })
    this.notification = notification.info(`编译项目中...`)

    const result = await CompilerManager.terminal.exec(cmd)

    if (result.code) {
      CompilerManager.button.setState({ building: false })
      this.notification.dismiss()
      notification.error('编译失败')
      throw new Error(result.logs)
    }

    CompilerManager.button.setState({ building: false })
    this.notification.dismiss()

    notification.success('编译成功')
  }

  async buildRemote(settings, projectManager, sourceFile) {
    CompilerManager.button.setState({ building: true })
    this.notification = notification.info(`项目编译中...`)
    const compilers = settings.compilers
    const filename = settings.main.replace(/^.*[\\\/]/, '').split('.').shift()
    let cmd = ''
    let image = ''

    if (!filename) {
      notification.error('编译失败')
    }

    if (settings.language === 'cpp') {
      image = `caictdevelop/bifchain-wasm-cdt:latest`
      cmd = `'pwd && ls && /home/app/bifchain-wasm-cdt/build/bin/wasmio-cpp ${settings.main} && ls &&  pwd && python2 /home/app/bifchain-wasm-cdt/wasm_content_to_base64.py helloworld.wasm -> output.bin'`
    } else {
      image = this.solImage
      cmd = `'/root/solidity/build/solc/solc --bin --abi '${settings.main}' -o build/contracts --overwrite --metadata'`
    }

    if (sourceFile) {
      cmd += ` --contracts_directory '${sourceFile}*'`
    }

    const result = await CompilerManager.terminal.exec(cmd, {
      image,
    })

    CompilerManager.button.setState({ building: false })

    this.notification.dismiss()

    if (result.code) {
      notification.error('构建失败')
      throw new Error(result.logs)
    }
    notification.success('构建成功')

    projectManager.refreshDirectory()
  }

  generateBuildCmdForSolidity(props) {
    const { projectRoot, sourceFile, main } = props
    const projectDir = fileOps.current.getDockerMountPath(projectRoot)

    const cmd = [
      `docker run -it --rm`,
      `-v "${projectDir}:${projectDir}"`,
      `-w "/root/solidity/build/solc"`,
      `${this.solImage}`,
      `./solc --bin --abi "${projectDir}/${main}" -o "${projectDir}/build/contracts" --overwrite --metadata`,
    ]

    if (sourceFile) {
      cmd.push(`--contracts_directory '${sourceFile}*'`)
    }

    return cmd.join(' ')
  }

  generateBuildCmdForCpp({ projectRoot, compilers, main }) {
    const projectDir = fileOps.current.getDockerMountPath(projectRoot)
    const containerName = `build-${new Date().getTime()}`
    // return
    const cmd = [
      `docker run -it --rm`,
      `--name ${containerName}`,
      `-v "${projectDir}:${projectDir}"`,
      '-v "/var/run/docker.sock:/var/run/docker.sock"',
      `-w "${projectDir}"`,
      'caictdevelop/bifchain-wasm-cdt:latest',
      '/bin/bash -xc',
      `"/home/app/bifchain-wasm-cdt/build/bin/wasmio-cpp  ${main} && python2 /home/app/bifchain-wasm-cdt/wasm_content_to_base64.py helloworld.wasm -> output.bin"`,
    ]

    return cmd.join(' ')
  }
}

export default new PlatonCompilerManager()
