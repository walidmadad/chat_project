#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <pthread.h>

#define PORT 2525        // Port sur lequel le serveur écoute
#define MAX_CLIENTS 10   // Nombre maximum de clients autorisés
#define BUFFER_SIZE 1024 // Taille du tampon pour les messages

// Structure pour stocker les informations d'un client
typedef struct
{
    int socket;    // Socket du client
    char name[50]; // Nom du client
} Client;

Client clients[MAX_CLIENTS];                              // Tableau pour stocker les clients connectés
int num_clients = 0;                                      // Nombre actuel de clients connectés
pthread_mutex_t client_mutex = PTHREAD_MUTEX_INITIALIZER; // Mutex pour protéger l'accès au tableau des clients

// Fonction pour gérer un client
void *handle_client(void *socket_desc)
{
    int sock = *(int *)socket_desc; // Récupère la socket du client
    free(socket_desc);              // Libère la mémoire allouée pour la socket
    char message[BUFFER_SIZE];      // Tampon pour les messages
    char client_name[50];           // Nom du client

    // Recevoir le nom du client
    memset(client_name, 0, sizeof(client_name));
    recv(sock, client_name, sizeof(client_name), 0);

    // Ajouter le client à la liste des clients connectés
    pthread_mutex_lock(&client_mutex);
    if (num_clients < MAX_CLIENTS)
    {
        clients[num_clients].socket = sock;
        strncpy(clients[num_clients].name, client_name, sizeof(clients[num_clients].name) - 1);
        num_clients++;
    }
    pthread_mutex_unlock(&client_mutex);

    printf("%s s'est connecté !\n", client_name);

    // Boucle pour recevoir et diffuser les messages du client
    while (1)
    {
        memset(message, 0, sizeof(message));                          // Réinitialise le tampon
        int bytes_received = recv(sock, message, sizeof(message), 0); // Reçoit un message du client
        if (bytes_received <= 0)                                      // Si le client se déconnecte ou qu'une erreur survient
        {
            printf("%s s'est déconnecté.\n", client_name);

            // Retirer le client de la liste des clients connectés
            pthread_mutex_lock(&client_mutex);
            for (int i = 0; i < num_clients; i++)
            {
                if (clients[i].socket == sock)
                {
                    clients[i] = clients[num_clients - 1]; // Remplace le client par le dernier
                    num_clients--;
                    break;
                }
            }
            pthread_mutex_unlock(&client_mutex);

            close(sock);        // Ferme la socket du client
            pthread_exit(NULL); // Termine le thread
        }

        printf("Message de %s : %s\n", client_name, message);

        // Diffuser le message à tous les autres clients
        pthread_mutex_lock(&client_mutex);
        for (int i = 0; i < num_clients; i++)
        {
            if (clients[i].socket != sock) // Ne pas envoyer le message à l'expéditeur
            {
                char full_message[2048];
                snprintf(full_message, sizeof(full_message), "{\"from\": \"%s\", \"text\": \"%s\"}", client_name, message);
                send(clients[i].socket, full_message, strlen(full_message), 0);
            }
        }
        pthread_mutex_unlock(&client_mutex);
    }
}

int main()
{
    int server_fd, new_socket, *new_sock;
    struct sockaddr_in server_addr, client_addr;
    socklen_t addr_size;

    // Création de la socket du serveur
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    server_addr.sin_family = AF_INET;         // IPv4
    server_addr.sin_addr.s_addr = INADDR_ANY; // Accepte les connexions sur toutes les interfaces
    server_addr.sin_port = htons(PORT);       // Définit le port du serveur

    // Liaison de la socket à l'adresse et au port
    bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr));

    // Mise en écoute de la socket
    listen(server_fd, MAX_CLIENTS);

    printf("Serveur en attente de connexions...\n");

    // Boucle principale pour accepter les connexions des clients
    while (1)
    {
        addr_size = sizeof(client_addr);
        new_socket = accept(server_fd, (struct sockaddr *)&client_addr, &addr_size); // Accepte une nouvelle connexion

        // Vérifie si le nombre maximum de clients est atteint
        pthread_mutex_lock(&client_mutex);
        if (num_clients >= MAX_CLIENTS)
        {
            printf("Trop de clients, connexion refusée.\n");
            close(new_socket); // Refuse la connexion
            pthread_mutex_unlock(&client_mutex);
            continue;
        }
        pthread_mutex_unlock(&client_mutex);

        // Alloue de la mémoire pour la nouvelle socket
        new_sock = malloc(sizeof(int));
        *new_sock = new_socket;

        // Crée un thread pour gérer le client
        pthread_t client_thread;
        pthread_create(&client_thread, NULL, handle_client, (void *)new_sock);
        pthread_detach(client_thread); // Détache le thread pour qu'il se termine automatiquement
    }

    return 0;
}