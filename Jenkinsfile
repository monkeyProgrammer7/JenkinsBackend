pipeline {
    agent any

    tools {
        nodejs 'Node_24' // Nombre definido en Global Tool Configuration
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner' // SonarQube Scanner definido en Global Tool Configuration
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
                // Si fallan las pruebas el build queda en FAILURE, pero el análisis de SonarQube se ejecuta igual
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    // test:coverage (package.json): salida en consola + reporte JUnit en junit.xml + cobertura en coverage/lcov.info
                    sh 'NO_COLOR=1 npm run test:coverage -- --reporter=default --reporter=junit --outputFile.junit=junit.xml'
                }
            }
            post {
                always {
                    junit 'junit.xml' // Publica reporte en Jenkins
                    archiveArtifacts artifacts: 'junit.xml', allowEmptyArchive: true
                }
            }
        }

        // Etapa 4: Análisis estático de código con SonarQube
        stage('SonarQube Analysis') {
            steps {
                // 'sonar-jenkins' es el servidor definido en Manage Jenkins > System (URL http://sonarqube:9000).
                // withSonarQubeEnv inyecta la URL y el token, por eso no se pasan aquí.
                // El resto de la configuración está en sonar-project.properties
                withSonarQubeEnv('sonar-jenkins') {
                    // La ruta de Node depende de la máquina de Jenkins, por eso se pasa aquí y no en el archivo
                    sh '${SCANNER_HOME}/bin/sonar-scanner -Dsonar.nodejs.executable=$(command -v node)'
                }
            }
        }
        // Etapa 5: Esperar el resultado del Quality Gate de SonarQube
        // SonarQube avisa a Jenkins mediante un webhook a http://jenkins:8080/sonarqube-webhook/
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Calidad no aprobada: ${qg.status}"
                        }
                    }
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
