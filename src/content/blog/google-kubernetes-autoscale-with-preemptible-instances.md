---
title: "Google Kubernetes autoscale with preemptible instances"
date: 2019-09-08
archived: true
aliases:
  - /post/google-kubernetes-autoscale-with-preemptible-instances/
---

```sh
export POOL_NAME='preempt-1'
export CLUSTER_NAME='cluster-1'
```

```sh
gcloud beta container node-pools create ${POOL_NAME} --preemptible \
	   --cluster ${CLUSTER_NAME} --enable-autoscaling \
	   --min-nodes=0 --max-nodes=50 \
	   --machine-type=n1-standard-2                                    
```

```yaml
apiVersion: v1
kind: Job
spec:
  nodeSelector:
    cloud.google.com/gke-preemptible: "true"
  template:
    spec:
      containers:
      - name: pyversion
        image: python:3.7
        command: ["python",  "--version"]
      restartPolicy: Never
  backoffLimit: 4
```
