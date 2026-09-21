cwlVersion: v1.2
class: Workflow
id: main
inputs:
  message: string
outputs:
  result:
    type: File
    outputSource: echo/result
steps:
  echo:
    in:
      message: message
    out: [result]
    run:
      class: CommandLineTool
      baseCommand: echo
      inputs:
        message:
          type: string
          inputBinding:
            position: 1
      stdout: result.txt
      outputs:
        result:
          type: File
          outputBinding:
            glob: result.txt
