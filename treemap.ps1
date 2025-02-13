# Defina os nomes das pastas a serem ignoradas
$ignoredDirs = @("node_modules", "mongo-data1", "mongo-data2", "mongo-data3", "mongo-data", ".git")

function Show-Tree {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Path,
        [int]$Indent = 0
    )

    # Obtém o nome da pasta atual. Se estiver na raiz, usa o próprio caminho.
    $folderName = Split-Path -Leaf $Path
    if ([string]::IsNullOrWhiteSpace($folderName)) {
        $folderName = $Path
    }

    # Se o diretório atual estiver na lista de ignorados, sai da função
    if ($ignoredDirs -contains $folderName) {
        return
    }

    # Monta a string de indentação (4 espaços por nível)
    $indentString = " " * (4 * $Indent)

    # Formata a saída:
    if ($Indent -eq 0) {
        # No nível zero, mostra o caminho completo
        $line = "$Path"
    }
    else {
        $line = "$indentString+-- $folderName"
    }

    # Adiciona a linha ao arquivo de saída
    $line | Out-File -FilePath output.txt -Append -Encoding UTF8

    # Lista os arquivos (não pastas) presentes no diretório atual
    Get-ChildItem -Path $Path -File -Force -ErrorAction SilentlyContinue | ForEach-Object {
        "$indentString    +-- $($_.Name)" | Out-File -FilePath output.txt -Append -Encoding UTF8
    }

    # Processa recursivamente os subdiretórios
    Get-ChildItem -Path $Path -Directory -Force -ErrorAction SilentlyContinue | ForEach-Object {
        # Se o subdiretório não estiver na lista de ignorados, chama a função recursivamente
        if ($ignoredDirs -notcontains $_.Name) {
            Show-Tree -Path $_.FullName -Indent ($Indent + 1)
        }
    }
}

# Se existir um arquivo output.txt, remove-o para evitar conteúdo duplicado
if (Test-Path "output.txt") {
    Remove-Item "output.txt" -Force
}

# Inicia a função a partir do diretório atual
Show-Tree -Path (Get-Location).Path -Indent 0

Write-Host "Mapa de diretórios gerado com sucesso em output.txt"
