#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <pthread.h>

#define PORT 2525
#define MAX_CLIENTS 10
#define BUFFER_SIZE 1024

typedef struct
{
    int socket;
    char name[50]; // Stocke le nom du client
} Client;

Client clients[MAX_CLIENTS];
int num_clients = 0;
pthread_mutex_t client_mutex = PTHREAD_MUTEX_INITIALIZER;

void *handle_client(void *socket_desc)
{
    int sock = *(int *)socket_desc;
    free(socket_desc);
    char message[BUFFER_SIZE];
    char client_name[50];

    // Recevoir le nom du client en premier
    memset(client_name, 0, sizeof(client_name));
    recv(sock, client_name, sizeof(client_name), 0);

    pthread_mutex_lock(&client_mutex);
    if (num_clients < MAX_CLIENTS)
    {
        clients[num_clients].socket = sock;
        strncpy(clients[num_clients].name, client_name, sizeof(clients[num_clients].name) - 1);
        num_clients++;
    }
    pthread_mutex_unlock(&client_mutex);

    printf("%s s'est connecté !\n", client_name);

    while (1)
    {
        memset(message, 0, sizeof(message));
        int bytes_received = recv(sock, message, sizeof(message), 0);
        if (bytes_received <= 0)
        {
            printf("%s s'est déconnecté.\n", client_name);

            pthread_mutex_lock(&client_mutex);
            for (int i = 0; i < num_clients; i++)
            {
                if (clients[i].socket == sock)
                {
                    clients[i] = clients[num_clients - 1]; // Remplace par le dernier
                    num_clients--;
                    break;
                }
            }
            pthread_mutex_unlock(&client_mutex);

            close(sock);
            pthread_exit(NULL);
        }

        printf("Message de %s : %s\n", client_name, message);

        // Diffuser à tous les clients
        pthread_mutex_lock(&client_mutex);
        for (int i = 0; i < num_clients; i++)
        {
            if (clients[i].socket != sock) // Ne pas envoyer à l'expéditeur
            {
                send(clients[i].socket, message, bytes_received, 0);
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

    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    bind(server_fd, (struct sockaddr *)&server_addr, sizeof(server_addr));
    listen(server_fd, MAX_CLIENTS);

    printf("Serveur en attente de connexions...\n");

    while (1)
    {
        addr_size = sizeof(client_addr);
        new_socket = accept(server_fd, (struct sockaddr *)&client_addr, &addr_size);

        pthread_mutex_lock(&client_mutex);
        if (num_clients >= MAX_CLIENTS)
        {
            printf("Trop de clients, connexion refusée.\n");
            close(new_socket);
            pthread_mutex_unlock(&client_mutex);
            continue;
        }
        pthread_mutex_unlock(&client_mutex);

        new_sock = malloc(sizeof(int));
        *new_sock = new_socket;

        pthread_t client_thread;
        pthread_create(&client_thread, NULL, handle_client, (void *)new_sock);
        pthread_detach(client_thread);
    }

    return 0;
}
