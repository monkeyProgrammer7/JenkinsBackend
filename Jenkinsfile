pipeline {
    agent any

    tools {
        nodejs 'Node_24' // Nombre definido en Global Tool Configuration
    }

    stages {
        // Etapa 1: Checkout del código desde GitHub
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/monkeyProgrammer7/JenkinsBackend.git'
            }
        }

        // Etapa 2: Instalar dependencias
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }

        // Etapa 3: Ejecutar pruebas unitarias (SQLite en memoria, sin BD externa)
        stage('Pruebas Unitarias') {
            steps {
                // vitest run: salida normal en consola + reporte JUnit en junit.xml
                sh 'NO_COLOR=1 npm test -- --reporter=default --reporter=junit --outputFile.junit=junit.xml'
            }
            post {
                always {
                    junit 'junit.xml' // Publica reporte en Jenkins
                    archiveArtifacts artifacts: 'junit.xml', allowEmptyArchive: true
                }
            }
        }
    }

    // Post-actions (opcional)
    post {
        success {
            echo '¡Pipeline ejecutado con éxito!'
        }
        failure {
            echo 'Pipeline fallido. Revisar logs.'
        }
    }
}
